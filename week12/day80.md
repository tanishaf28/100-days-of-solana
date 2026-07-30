# Day 80: Adversarial LiteSVM Tests

## Steps

1. **Scaffold the vault program.** Create a fresh project and drop in the code about to be attacked. The withdraw handler is the high-value target: it moves balance out, so it's the instruction worth attacking from every angle.

   ```bash
   anchor init vault
   cd vault
   ```

   Anchor scaffolds a default program with a no-op `initialize` instruction and a matching test. Delete that default test, `programs/vault/tests/test_initialize.rs`, since it references `initialize` and won't compile against the vault code. Then replace the contents of `programs/vault/src/lib.rs` with the program below.

   ```rust
   use anchor_lang::prelude::*;

   declare_id!("REPLACE_WITH_YOUR_DECLARED_ID");

   #[program]
   pub mod vault {
       use super::*;

       pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
           let vault = &mut ctx.accounts.vault;

           // Arithmetic safety: refuse to underflow instead of wrapping.
           vault.balance = vault
               .balance
               .checked_sub(amount)
               .ok_or(VaultError::InsufficientFunds)?;

           Ok(())
       }
   }

   #[derive(Accounts)]
   pub struct Withdraw<'info> {
       #[account(
           mut,
           seeds = [b"vault", authority.key().as_ref()],
           bump,
           has_one = authority,
       )]
       pub vault: Account<'info, Vault>,
       pub authority: Signer<'info>,
   }

   #[account]
   pub struct Vault {
       pub authority: Pubkey,
       pub balance: u64,
   }

   #[error_code]
   pub enum VaultError {
       #[msg("Withdrawal exceeds vault balance")]
       InsufficientFunds, // Anchor assigns this custom code 6000
   }
   ```

   Leave the `declare_id!` value as the one Anchor generated for the project. The `REPLACE_WITH_YOUR_DECLARED_ID` above is a placeholder, not a real address: don't paste it in. If `lib.rs` and `Anchor.toml` ever drift apart, run `anchor keys sync` to line them back up.

   Three defenses live in that small surface: `has_one = authority` ties the vault to its owner, the `seeds` plus `bump` pair proves the account is the real PDA and not a look-alike, and `checked_sub` refuses to underflow the balance. One attack per defense, coming up.

2. **Add the testing dependencies.** In the program's `Cargo.toml`, under `[dev-dependencies]`:

   ```toml
   [dev-dependencies]
   litesvm = "0.13.0"
   solana-sdk = "3.0"
   ```

   One Anchor 1.0 requirement worth checking while in `Cargo.toml`: the workspace-root `Cargo.toml` must set `overflow-checks = true` under `[profile.release]`. `anchor init` adds this automatically, so it only needs adding by hand if the workspace was assembled manually.

3. **Build a small harness.** Adversarial tests share a lot of setup: spin up the VM, load the compiled program, fund some keypairs, and create a vault in a known-good state so each attack starts from a realistic position. Create `tests/adversarial.rs` in the program crate. The two Anchor traits, `InstructionData` and `ToAccountMetas`, let instructions get built directly from the program's generated types instead of hand-assembling discriminators and account lists.

   ```rust
   use anchor_lang::{AccountSerialize, InstructionData, ToAccountMetas};
   use litesvm::LiteSVM;
   use solana_sdk::{
       instruction::{Instruction, InstructionError},
       pubkey::Pubkey,
       signature::{Keypair, Signer},
       transaction::{Transaction, TransactionError},
   };

   // Pull in the program crate to reuse its instruction
   // and account types. Replace `vault` with your crate name.
   use vault::{accounts, instruction, Vault};

   const PROGRAM_ID: Pubkey = vault::ID;

   /// Boot a VM with the program loaded and a funded payer.
   fn setup() -> (LiteSVM, Keypair) {
       let mut svm = LiteSVM::new();
       svm.add_program(
           PROGRAM_ID,
           include_bytes!("../../../target/deploy/vault.so"),
       )
       .unwrap();

       let payer = Keypair::new();
       svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();
       (svm, payer)
   }

   /// Place a vault account in a known state, owned by `authority`,
   /// at its canonical PDA, holding `balance`.
   fn seed_vault(svm: &mut LiteSVM, authority: &Pubkey, balance: u64) -> Pubkey {
       let (vault_pda, _bump) =
           Pubkey::find_program_address(&[b"vault", authority.as_ref()], &PROGRAM_ID);

       let mut data = Vec::new();
       // `Vault::try_serialize` writes the 8-byte discriminator AND the
       // borsh-serialized struct, so do not prepend the discriminator again.
       Vault { authority: *authority, balance }
           .try_serialize(&mut data)
           .unwrap();

       let mut account = solana_sdk::account::Account {
           lamports: 1_000_000_000,
           data,
           owner: PROGRAM_ID,
           executable: false,
           rent_epoch: 0,
       };
       // try_serialize produced exactly 8 + size_of::<Vault>() bytes;
       // this truncate is a harmless safety net.
       account.data.truncate(8 + std::mem::size_of::<Vault>());
       svm.set_account(vault_pda, account).unwrap();

       vault_pda
   }

   /// The one assertion that keeps adversarial tests honest:
   /// the transaction failed, AND it failed with the exact code meant.
   fn assert_custom_error(
       result: Result<impl std::fmt::Debug, litesvm::types::FailedTransactionMetadata>,
       expected_code: u32,
   ) {
       let failure = result.expect_err("expected this transaction to fail, but it succeeded");
       match failure.err {
           TransactionError::InstructionError(_, InstructionError::Custom(code)) => {
               assert_eq!(
                   code, expected_code,
                   "failed for the wrong reason: got code {code}, wanted {expected_code}"
               );
           }
           other => panic!("expected a custom program error, got {other:?}"),
       }
   }
   ```

4. **Attack one: the wrong signer.** The most common real-world exploit is an authorized action performed by an unauthorized caller. An attacker generates their own keypair, points the `authority` field at it, and signs the transaction themselves. They're a perfectly valid signer; they're just not the signer. Because the vault PDA is derived from `authority.key()`, passing a different signer makes Anchor re-derive a different address, so the seeds check rejects it first with `ConstraintSeeds`, code 2006.

   ```rust
   #[test]
   fn attacker_cannot_withdraw_with_wrong_authority() {
       let (mut svm, _payer) = setup();

       let real_owner = Keypair::new();
       let attacker = Keypair::new();
       svm.airdrop(&attacker.pubkey(), 1_000_000_000).unwrap();

       // The vault belongs to real_owner.
       let vault_pda = seed_vault(&mut svm, &real_owner.pubkey(), 500);

       // The attacker submits a withdraw, claiming to be the authority.
       let ix = Instruction {
           program_id: PROGRAM_ID,
           accounts: accounts::Withdraw {
               vault: vault_pda,
               authority: attacker.pubkey(),
           }
           .to_account_metas(None),
           data: instruction::Withdraw { amount: 500 }.data(),
       };

       let tx = Transaction::new_signed_with_payer(
           &[ix],
           Some(&attacker.pubkey()),
           &[&attacker],
           svm.latest_blockhash(),
       );

       // 2006 = ConstraintSeeds. The vault PDA is derived from
       // authority.key(), so a different signer derives a different
       // address and the seeds check rejects it before has_one runs.
       assert_custom_error(svm.send_transaction(tx), 2006);
   }
   ```

5. **Attack two: the look-alike account.** Here the attacker owns a vault of their own, derived from their own key, and tries to pass it where a different vault is expected, or passes any account that isn't the canonical PDA for the seeds. The `seeds` plus `bump` constraint recomputes the expected address and compares. A mismatch returns `ConstraintSeeds`, code 2006.

   ```rust
   #[test]
   fn substituted_account_is_rejected_by_seeds() {
       let (mut svm, _payer) = setup();

       let owner = Keypair::new();
       svm.airdrop(&owner.pubkey(), 1_000_000_000).unwrap();
       let _real_vault = seed_vault(&mut svm, &owner.pubkey(), 500);

       // A vault-shaped account at an address that is NOT the PDA
       // for these seeds: a decoy the attacker controls.
       let decoy = Keypair::new();
       let mut data = Vec::new();
       Vault { authority: owner.pubkey(), balance: 999 }
           .try_serialize(&mut data)
           .unwrap();
       data.truncate(8 + std::mem::size_of::<Vault>());
       svm.set_account(
           decoy.pubkey(),
           solana_sdk::account::Account {
               lamports: 1_000_000_000,
               data,
               owner: PROGRAM_ID,
               executable: false,
               rent_epoch: 0,
           },
       )
       .unwrap();

       let ix = Instruction {
           program_id: PROGRAM_ID,
           accounts: accounts::Withdraw {
               vault: decoy.pubkey(), // not the canonical PDA
               authority: owner.pubkey(),
           }
           .to_account_metas(None),
           data: instruction::Withdraw { amount: 999 }.data(),
       };

       let tx = Transaction::new_signed_with_payer(
           &[ix],
           Some(&owner.pubkey()),
           &[&owner],
           svm.latest_blockhash(),
       );

       // 2006 = ConstraintSeeds. The passed account is not the
       // PDA these seeds derive.
       assert_custom_error(svm.send_transaction(tx), 2006);
   }
   ```

6. **Attack three: drain more than exists.** Now the caller is legitimate but greedy. They own the vault, they sign correctly, and they ask to withdraw more than the balance. Without `checked_sub`, `u64` subtraction would silently wrap to a gigantic number and the accounting would be ruined. The arithmetic guard turns that into a clean, named failure: the custom `InsufficientFunds`, which Anchor assigns custom code 6000 because it's the first variant in the error enum.

   ```rust
   #[test]
   fn overdraw_underflows_safely() {
       let (mut svm, _payer) = setup();

       let owner = Keypair::new();
       svm.airdrop(&owner.pubkey(), 1_000_000_000).unwrap();
       let vault_pda = seed_vault(&mut svm, &owner.pubkey(), 100);

       let ix = Instruction {
           program_id: PROGRAM_ID,
           accounts: accounts::Withdraw {
               vault: vault_pda,
               authority: owner.pubkey(),
           }
           .to_account_metas(None),
           data: instruction::Withdraw { amount: 1_000 }.data(), // more than 100
       };

       let tx = Transaction::new_signed_with_payer(
           &[ix],
           Some(&owner.pubkey()),
           &[&owner],
           svm.latest_blockhash(),
       );

       // 6000 = your VaultError::InsufficientFunds.
       assert_custom_error(svm.send_transaction(tx), 6000);
   }
   ```

7. **Confirm a real withdrawal still works.** Adversarial tests prove the locks hold, but a locked door that never opens is also a bug. Keep one positive control alongside the attacks: the legitimate owner withdrawing a valid amount should succeed, and the balance should drop. If an over-eager constraint starts rejecting honest callers, this test catches it.

## Run it

```bash
anchor build && cargo test --manifest-path programs/vault/Cargo.toml
```

```
GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf

running 3 tests
test substituted_account_is_rejected_by_seeds ... ok
test attacker_cannot_withdraw_with_wrong_authority ... ok
test overdraw_underflows_safely ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.31s
```

All three attacks fail as intended, and the vault program's constraints hold against every angle tried.
