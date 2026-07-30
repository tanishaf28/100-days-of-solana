# Day 58: Building the Counter Program and Its First Rust Test

## Verifying the toolchain

```text
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana --version
rustc --version
cargo --version
node --version
solana-cli 3.1.10 (src:7bc9c805; feat:1620780344, client:Agave)
rustc 1.95.0 (59807616e 2026-04-14)
cargo 1.95.0 (f2d3ce0bd 2026-03-21)
v24.10.0
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ anchor --version
anchor-cli 1.1.2
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ cd counter
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ anchor build
   Compiling counter v0.1.0 (/mnt/c/Users/T_fonsec/solana/counter/programs/counter)
warning: unused import: `state::*`
  --> programs/counter/src/lib.rs:10:9
   |
10 | pub use state::*;
   |         ^^^^^^^^
   |
   = note: `#[warn(unused_imports)]` on by default

warning: `counter` (lib) generated 1 warning (run `cargo fix --lib -p counter` to apply 1 suggestion)
    Finished `release` profile [optimized] target(s) in 9.74s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 4m 50s
     Running unittests src/lib.rs (/mnt/c/Users/T_fonsec/solana/counter/target/debug/deps/counter-c28b29f5be3e5c50)
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ cargo test -p counter --test counter -- --nocapture

running 1 test
test initialize_sets_count_to_zero ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.44s
```

## Steps

1. Open `programs/counter/src/lib.rs`. Replace the scaffolded body with a program that owns a `Counter` account and an `initialize` instruction:
   ```rust
   use anchor_lang::prelude::*;

   declare_id!("REPLACE_WITH_YOUR_DECLARED_ID");

   #[program]
   pub mod counter {
       use super::*;

       pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
           let counter = &mut ctx.accounts.counter;
           counter.authority = ctx.accounts.authority.key();
           counter.count = 0;
           Ok(())
       }
   }

   #[derive(Accounts)]
   pub struct Initialize<'info> {
       #[account(
           init,
           payer = authority,
           space = 8 + Counter::INIT_SPACE,
       )]
       pub counter: Account<'info, Counter>,
       #[account(mut)]
       pub authority: Signer<'info>,
       pub system_program: Program<'info, System>,
   }

   #[account]
   #[derive(InitSpace)]
   pub struct Counter {
       pub authority: Pubkey,
       pub count: u64,
   }
   ```
   I left the `declare_id!` value as the one Anchor put there when it scaffolded the project. Three things worth pointing at:
   - `#[account]` on `Counter` tells Anchor this struct represents an on-chain account; it adds an 8-byte discriminator so the program can later verify "yes, this is one of mine."
   - `#[derive(InitSpace)]` auto-computes the byte size of the fields. The `8 +` in the `space` attribute accounts for the discriminator that sits in front.
   - `init` on the counter field is the constraint that does the heavy lifting: it makes a CPI to the System Program, allocates the right number of bytes, funds the rent from `authority`, and assigns the account to my program. I write one line; Anchor writes the boilerplate.

   Note: before building, delete the default `test_initialize.rs` file that Anchor generated when it scaffolded the project. It still references the old initialize test setup and can cause issues with the build. I'd write my own Rust test in a later step.

2. Build the program so the test has a compiled artifact to load:
   ```bash
   anchor build
   ```
   That produces `target/deploy/counter.so`, the SBF binary that LiteSVM will execute.

3. Add a Rust integration test. From the project root, create the file `programs/counter/tests/counter.rs` (creating the `tests` directory if it does not exist):
   ```rust
   use anchor_lang::{
       solana_program::system_program,
       AccountDeserialize, InstructionData, ToAccountMetas,
   };
   use counter::{accounts as counter_accounts, instruction as counter_instruction, Counter};
   use litesvm::LiteSVM;
   use solana_instruction::Instruction;
   use solana_keypair::Keypair;
   use solana_signer::Signer;
   use solana_transaction::Transaction;

   #[test]
   fn initialize_sets_count_to_zero() {
       let mut svm = LiteSVM::new();

       let payer = Keypair::new();
       svm.airdrop(&payer.pubkey(), 10 * 1_000_000_000).unwrap();

       let program_id = counter::ID;
       let so_path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../target/deploy/counter.so");
       svm.add_program_from_file(program_id, so_path).unwrap();

       let counter_kp = Keypair::new();

       let ix = Instruction {
           program_id,
           accounts: counter_accounts::Initialize {
               counter: counter_kp.pubkey(),
               authority: payer.pubkey(),
               system_program: system_program::ID,
           }
           .to_account_metas(None),
           data: counter_instruction::Initialize {}.data(),
       };

       let tx = Transaction::new_signed_with_payer(
           &[ix],
           Some(&payer.pubkey()),
           &[&payer, &counter_kp],
           svm.latest_blockhash(),
       );

       svm.send_transaction(tx).expect("initialize should succeed");

       let raw = svm.get_account(&counter_kp.pubkey()).expect("counter exists");
       let state = Counter::try_deserialize(&mut raw.data.as_slice()).unwrap();

       assert_eq!(state.count, 0);
       assert_eq!(state.authority, payer.pubkey());
   }
   ```
   A few things to notice. The `accounts` and `instruction` modules under `counter::` are generated for free by the `#[program]` macro: one struct per `#[derive(Accounts)]` with the same fields, one struct per instruction handler that knows how to serialize itself with the right discriminator. That is why I can construct a real transaction without hand-rolling any byte layout.

   The `counter_kp` keypair signs the transaction alongside `payer` because the System Program will not create an account at a given address unless the holder of that address proves they want it. This is the same rule from Day 17, on why a transfer needs a signature.

4. Add the test dependency. Open `programs/counter/Cargo.toml` and look at the `[dev-dependencies]` section. Anchor already scaffolds most of what the test needs, including LiteSVM:
   ```toml
   [dev-dependencies]
   litesvm = "0.10.0"
   solana-message = "3.0.1"
   solana-transaction = "3.0.2"
   solana-signer = "3.0.0"
   solana-keypair = "3.0.1"
   ```
   The only crate the test imports that is not already there is `solana-instruction` (for the `Instruction` type). Add this one line under `[dev-dependencies]`:
   ```toml
   solana-instruction = "3"
   ```
   If cargo warns about resolver mismatches, set `resolver = "2"` under `[package]`.

## Run it

Run the test from the project root:
```bash
cargo test -p counter --test counter -- --nocapture
```

I should see one passing test in well under a second. To see the program logs the runtime emitted, change the `.expect(...)` on `send_transaction` to capture the result and print `result.logs`.
