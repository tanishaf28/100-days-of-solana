# Day 61: Breaking the Counter Program on Purpose, Three Ways

## Steps

Before changing anything, confirm the baseline is healthy:
```bash
git status
anchor build && cargo test -p counter
```
If anything is red right now, fix it before starting. The point of today is to introduce a known bug into a known-good baseline. I can't do that on top of an unknown failure.

### Experiment 1: weaken the authority check

Open `programs/counter/src/lib.rs` and find the `Increment` accounts struct. It looks something like this:
```rust
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}
```

Delete the `has_one = authority` portion of that constraint, so only `#[account(mut)]` remains. Save and re-run the suite:
```bash
anchor build && cargo test -p counter
```

One specific test should fail: the "rejects wrong signer" test written yesterday. Reading the failure message carefully: the test asserted that an unauthorized call would be rejected. With the constraint gone, the program now happily accepts that call, and the assertion no longer holds.

This is the most important moment of the day. My negative test just caught a real regression. Without it, I would silently ship a program that lets anyone increment anyone else's counter. I put the constraint back exactly as it was, saved, re-ran, and confirmed green.

### Experiment 2: break the arithmetic

Find the body of the `increment` handler. It contains something like:
```rust
counter.count = counter.count
    .checked_add(1)
    .ok_or(ProgramError::ArithmeticOverflow)?;
```

Change `checked_add(1)` to `checked_add(2)`. Save and re-run the suite.

(Why add 2 instead of switching to `checked_sub`? Because a fresh counter sits at zero, so subtracting would underflow and fail the whole transaction with an `ArithmeticOverflow` error before any assertion runs. Adding 2 lets the transaction succeed while storing a wrong number, which is exactly the kind of silent bug only an assertion can catch.)

The happy-path increment test should fail at the assertion that compares the post-call count to its expected value. The failure prints the expected and actual numbers side by side: the counter holds 2, the test expected 1. A one-character change in production code produced a clear, specific failure with a clear, specific line number. That is what an assertion is for.

Restored `checked_add(2)` back to `checked_add(1)`, saved, re-ran, and confirmed green.

### Experiment 3: break initialization

In the `initialize` handler, find the line that sets the authority field on the freshly created counter:
```rust
counter.authority = ctx.accounts.authority.key();
```

Comment that line out. Save and re-run the suite.

This one is sneaky. The initialize transaction itself still succeeds: the account gets created, the rent gets paid, the count is zero. The bug only surfaces when the happy-path test calls increment with the correct wallet, because the on-chain authority field was left as the default `Pubkey` (all zeros) and the real wallet does not match it. The test panics on the `send_transaction` for increment, and the program logs spell out exactly what went wrong:
```text
Error Code: ConstraintHasOne. Error Number: 2001.
Error Message: A has one constraint was violated.
Left:
11111111111111111111111111111111
Right:
<your authority pubkey>
```
Left is the authority stored on the counter account, all zeros because nobody set it. Right is the wallet that signed. The two failure tests stay green the whole time, by the way: they only check that a bad call gets rejected, and a mismatch is still a mismatch.

Notice where the error points. The Anchor runtime reports the `has_one` violation at the increment step, not at the initialize step where the bug actually lives. That gap between "where it failed" and "where it broke" is a useful lesson on its own: the tests caught the bug, but the failure points downstream of the cause. Uncommented the line, saved, re-ran, and confirmed green.

## Run it

The whole experiment cycle is the same three commands, run for each break:
```bash
anchor build && cargo test -p counter   # baseline: should be green
# make one break in lib.rs
anchor build && cargo test -p counter   # should now be red, with a specific failure
# revert the break
anchor build && cargo test -p counter   # back to green
```
`anchor build` recompiles the program so LiteSVM picks up the change; `cargo test -p counter` runs the Rust integration tests under `programs/counter/tests/`. (`anchor test` is for the TypeScript harness under `tests/`, which is not what I'm using in this arc.)

## Terminal session

Experiment 1 (deleted `has_one = authority`) failure output:
```text
    Finished `test` profile [unoptimized + debuginfo] target(s) in 1m 44s
     Running unittests src/lib.rs (target/debug/deps/counter-a54853f4d36ef707)

running 1 test
test test_id ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/counter.rs (target/debug/deps/counter-41f52319e809e6fd)

running 3 tests
test increment_fails_when_wrong_authority_signs ... FAILED
test initialize_then_increment ... FAILED
test initialize_fails_when_counter_already_exists ... ok

failures:

---- increment_fails_when_wrong_authority_signs stdout ----

thread 'increment_fails_when_wrong_authority_signs' panicked at programs/counter/tests/counter.rs:150:5:
increment should fail when signed by the wrong authority
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace

---- initialize_then_increment stdout ----

thread 'initialize_then_increment' panicked at programs/counter/tests/counter.rs:118:5:
assertion `left == right` failed
  left: 2
 right: 1


failures:
    increment_fails_when_wrong_authority_signs
    initialize_then_increment

test result: FAILED. 1 passed; 2 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.32s

error: test failed, to rerun pass `-p counter --test counter`
```

Experiment 3 (commented out the authority assignment) failure output:
```text
    Finished `test` profile [unoptimized + debuginfo] target(s) in 1m 31s
     Running unittests src/lib.rs (target/debug/deps/counter-a54853f4d36ef707)

running 1 test
test test_id ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/counter.rs (target/debug/deps/counter-41f52319e809e6fd)

running 3 tests
test increment_fails_when_wrong_authority_signs ... ok
test initialize_fails_when_counter_already_exists ... ok
test initialize_then_increment ... FAILED

failures:

---- initialize_then_increment stdout ----

thread 'initialize_then_increment' panicked at programs/counter/tests/counter.rs:113:30:
called `Result::unwrap()` on an `Err` value: FailedTransactionMetadata { err: InstructionError(0, Custom(2001)), meta: TransactionMetadata { signature: 3aTvaWbUGvN3hv5P7iz96Le9E919LmGg2WbPdeT146hkL1Gq3c6T1Ls8Q1L3sQzjPEf2duVVjSEV43pfsHSo4GNm, logs: ["Program HxtUYmnPb73bdujNSuMd8XCsX4yH2N6CPiwPz3LG5mqY invoke [1]", "Program log: Instruction: Increment", "Program log: AnchorError caused by account: counter. Error Code: ConstraintHasOne. Error Number: 2001. Error Message: A has one constraint was violated.", "Program log: Left:", "Program log: 11111111111111111111111111111111", "Program log: Right:", "Program log: 9EJBFhhrHKcC2bfb9vef9CoeAVvVhRVpnMXwggSKQShv", "Program HxtUYmnPb73bdujNSuMd8XCsX4yH2N6CPiwPz3LG5mqY consumed 3513 of 200000 compute units", "Program HxtUYmnPb73bdujNSuMd8XCsX4yH2N6CPiwPz3LG5mqY failed: custom program error: 0x7d1"], inner_instructions: [[]], compute_units_consumed: 3513, return_data: TransactionReturnData { program_id: HxtUYmnPb73bdujNSuMd8XCsX4yH2N6CPiwPz3LG5mqY, data: [] }, fee: 5000 } }
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    initialize_then_increment

test result: FAILED. 2 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.33s

error: test failed, to rerun pass `-p counter --test counter`
```
