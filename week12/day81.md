# Day 81: Property and Fuzz Testing with proptest and Trident

## Steps

1. **Extract the arithmetic to prove correct.** Property tests are easiest when the logic under test is a plain function with no accounts attached. Pull the math out of the instruction handler into a small, pure function so both the handler and the test can call it. For a deposit, that's a single checked add:

   ```rust
   // programs/your_program/src/math.rs
   // Returns the new balance, or None if the deposit would overflow u64.
   pub fn apply_deposit(balance: u64, amount: u64) -> Option<u64> {
       balance.checked_add(amount)
   }
   ```

   Using `checked_add` instead of `+` is the arithmetic-safety habit from earlier this arc: on a release build a raw `+` can wrap silently, while `checked_add` hands back a `None` that must be dealt with. The property test is how to prove that's actually handled.

   Two wiring steps make this real, and both are easy to miss. First, a `src/math.rs` file isn't compiled until it's declared, so add `mod math;` to the top of `lib.rs` (right under `declare_id!`). Without that line the file is an orphan and the test silently never runs. Second, a handler has to actually call `apply_deposit`, both so it isn't dead code and so the fuzzer has an instruction to drive. The withdraw-only vault from Day 80 has no deposit, so add one:

   ```rust
   // in #[program] mod vault
   pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
       let vault = &mut ctx.accounts.vault;
       vault.authority = ctx.accounts.authority.key();
       vault.balance = math::apply_deposit(vault.balance, amount).ok_or(VaultError::Overflow)?;
       Ok(())
   }

   #[derive(Accounts)]
   pub struct Deposit<'info> {
       #[account(
           init_if_needed,
           payer = authority,
           space = 8 + 32 + 8,
           seeds = [b"vault", authority.key().as_ref()],
           bump,
       )]
       pub vault: Account<'info, Vault>,
       #[account(mut)]
       pub authority: Signer<'info>,
       pub system_program: Program<'info, System>,
   }
   ```

   `init_if_needed` lets the fuzzer create a vault and then grow it from empty state, which is what makes this instruction fuzzable at all. It needs a feature flag in the program's `Cargo.toml` (`anchor-lang = { version = "...", features = ["init-if-needed"] }`). The handler also references a new `Overflow` error, so add that variant to the enum:

   ```rust
   #[error_code]
   pub enum VaultError {
       #[msg("Withdrawal exceeds vault balance")]
       InsufficientFunds,
       #[msg("Deposit overflows vault balance")]
       Overflow,
   }
   ```

2. **Add `proptest` as a dev-dependency.** In the program's `Cargo.toml`, add the test-only crate. The current release is 1.11.0; pinning to `"1"` keeps you on the latest compatible 1.x:

   ```toml
   [dev-dependencies]
   proptest = "1"
   ```

3. **Write the property, not the example.** A property describes what must be true for every input. The `proptest!` macro generates inputs automatically, and when it finds a failure it shrinks that input down to the smallest value that still fails, so the result is a clean counterexample instead of a giant random number. Add this test module at the bottom of the same `math.rs` file, `use super::apply_deposit` pulls in the function defined just above it:

   ```rust
   #[cfg(test)]
   mod tests {
       use super::apply_deposit;
       use proptest::prelude::*;

       proptest! {
           // proptest runs this hundreds of times with generated u64 pairs.
           #[test]
           fn deposit_never_shrinks_a_balance(balance in any::<u64>(), amount in any::<u64>()) {
               match apply_deposit(balance, amount) {
                   // If it succeeded, the new balance must be at least the old one.
                   Some(new_balance) => prop_assert!(new_balance >= balance),
                   // If it returned None, the real sum must genuinely overflow.
                   None => prop_assert!(balance.checked_add(amount).is_none()),
               }
           }
       }
   }
   ```

   Read the property out loud: a deposit either grows the balance or refuses honestly. There is no third option where it silently wraps to a tiny number. That single test covers a space no hand-written example list could.

4. **Install Trident for full-program fuzzing.** `proptest` is perfect for pure functions, but the real risk lives in sequences of instructions against live account state. That's Trident's job. It works with an Anchor 1.0 program because it loads the compiled `.so` and runs it in its own in-process VM, generating the input types it needs from the IDL, so it doesn't care which Anchor version built the program. Install the CLI (the current stable is the 0.12.x line; check crates.io for the exact latest):

   ```bash
   cargo install trident-cli
   ```

5. **Generate the fuzz scaffold.** From the root of the Anchor workspace, let Trident read the program and write a starter fuzz test. This creates a `trident-tests/` directory and a `Trident.toml` config:

   ```bash
   trident init
   ```

6. **Teach the fuzzer the invariant.** `trident init` writes the scaffold but leaves the flows empty: `#[init]` and `#[flow]` arrive as blank stubs, and until they're filled in, Trident invokes nothing and prints an empty instruction table. This is Trident's manually-guided fuzzing design, not a bug: the flow that builds an instruction from the generated types, sends it, and asserts the invariant before and after has to be written by hand. Open `trident-tests/fuzz_0/test_fuzz.rs` and replace the stub flow with:

   ```rust
   #[flow]
   fn deposit_never_shrinks(&mut self) {
       let authority = self.fuzz_accounts.authority.insert(&mut self.trident, None);
       self.trident.airdrop(&authority, 10_000_000_000);

       let (vault_pda, _) =
           Pubkey::find_program_address(&[b"vault", authority.as_ref()], &vault::program_id());

       let before = self.trident
           .get_account_with_type::<Vault>(&vault_pda, 8)
           .map(|v| v.balance)
           .unwrap_or(0);

       let amount = self.trident.random_from_range(0..1_000_000u64);

       let ix = vault::DepositInstruction::data(vault::DepositInstructionData::new(amount))
           .accounts(vault::DepositInstructionAccounts::new(vault_pda, authority))
           .instruction();
       self.trident.process_transaction(&[ix], Some("Deposit"));

       if let Some(v) = self.trident.get_account_with_type::<Vault>(&vault_pda, 8) {
           assert!(v.balance >= before, "deposit shrank the balance");
       }
   }
   ```

   Match `DepositInstructionAccounts::new(...)` to the signature in the generated `types.rs`; Trident fills `system_program` itself, so it's usually just `(vault, authority)`. The same shape works for other invariants: an authority that must never change, a total that must equal the sum of deposits.

## Run it

Run the fast property test first, then turn the fuzzer loose on the whole program:

```bash
# Property test: hundreds of generated u64 pairs against apply_deposit
cargo test deposit_never_shrinks_a_balance

# Full-program fuzzing: run this from inside the trident-tests directory
# that `trident init` created, because that is where Trident.toml lives and
# the CLI searches upward from the current directory to find it. Replace the
# name with the generated fuzz test (the scaffold names the first one fuzz_0).
cd trident-tests
trident fuzz run fuzz_0
```

```
arning: `fuzz_tests` (bin "fuzz_0") generated 1 warning
    Finished `release` profile [optimized] target(s) in 5m 46s
     Running `target/release/fuzz_0`
Overall:   [00:00:01] [###########################################################################################################################################] 100000/100000 (100%) [00:00:00] Parallel fuzzing completed!
+-------------+---------------+------------+-----------+----------------------+
| Instruction | Invoked Total | Ix Success | Ix Failed | Instruction Panicked |
+-------------+---------------+------------+-----------+----------------------+
| Deposit     | 100000        | 100000     | 0         | 0                    |
+-------------+---------------+------------+-----------+----------------------+
MASTER SEED used: "538355fffea329fc89ca96b7f29004e215c69e225d8edf4a8b56383de388f163"
```

Read the Trident summary table, not just the "completed" line: the instruction must show a non-zero `Invoked Total`. An empty table means the flow is still a stub and nothing was fuzzed, a green run that tested zero transactions. A real run shows, as above, 100,000 `Deposit` calls invoked, all succeeding, zero panicked, with the invariant holding on every one.

If a property holds, `proptest` prints a normal green pass, proving something about every input it tried. If Trident finds a transaction that violates an invariant or panics, it stops and hands back the exact instruction sequence and inputs that did it, ready to drop straight into a regression test.
