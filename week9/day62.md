---
title: "The Regression That Never Shipped: How My Own Test Caught a One-Line Anchor Bug Before Anyone Else Could"
published: true
tags: 100DaysOfSolana, solana, rust, anchor, testing
---

## The setup

Five days ago I ran `anchor init counter` and got a program that does nothing: one no-op instruction and a scaffolded test that proves the toolchain works. Since then I've added state, added a second instruction, added two tests whose entire job is to fail on purpose, and then, on purpose, broken the program three times just to watch those tests catch it.

This post is the write-up. If you want the tl;dr: **an assertion I wrote on Day 60 caught a real access-control regression I introduced on Day 61, in the same afternoon, before it ever touched a cluster.** Here's how the program and the tests got there.

## Where every Anchor program starts: the accounts struct

Before there's a single line of business logic, Anchor wants to know who's allowed to be in the room:

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + Counter::INIT_SPACE)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

Coming from a Web2 backend, this struct is the biggest mental shift. There's no request body to parse and no route handler deciding what's allowed; the *type signature* is the authorization. `counter` is marked `init`, so Anchor will create this account for you via a CPI to the System Program, size it, and assign it to your program, all before your function body runs. `authority` is a `Signer`, so the runtime has already checked a valid private key signed this transaction, your code never has to. `system_program` is there because `init` needs to call it. By the time `initialize` executes, every account in scope has already been validated to be exactly what it claims to be.

## The handlers: one that creates, one that guards

```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.authority = ctx.accounts.authority.key();
    counter.count = 0;
    Ok(())
}
```

Three lines, because the accounts struct already did the expensive part. `ctx.accounts` hands you fully-deserialized, fully-validated Rust structs, no manual byte parsing, no manual ownership checks. All that's left is business logic: stamp the signer as the owner, zero the counter.

```rust
pub fn increment(ctx: Context<Increment>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.count = counter.count
        .checked_add(1)
        .ok_or(ProgramError::ArithmeticOverflow)?;
    Ok(())
}
```

```rust
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub counter: Account<'info, Counter>,
    pub authority: Signer<'info>,
}
```

`checked_add` instead of `+=` means an overflow returns an error instead of silently wrapping. But the line doing the real security work is `has_one = authority`. Before `increment` ever runs, Anchor compares the `authority` field *stored on the counter account* to the `authority` signer *in this transaction*. If they don't match, the whole transaction is rejected; my handler body never executes, so it never gets the chance to be wrong. One attribute, and "you can't touch someone else's counter" stops being a thing I have to remember to check and becomes a thing that's structurally impossible to skip.

## The tests, and the one sentence that justifies each

Here's the happy path, which exercises both instructions end to end:

```rust
#[test]
fn initialize_then_increment() {
    let mut svm = LiteSVM::new();
    let program_id = counter::ID;
    svm.add_program_from_file(program_id, so_path).unwrap();

    let authority = Keypair::new();
    svm.airdrop(&authority.pubkey(), 1_000_000_000).unwrap();
    let counter_kp = Keypair::new();

    // ...build and send the Initialize instruction...
    // ...build and send the Increment instruction...

    let account = svm.get_account(&counter_kp.pubkey()).unwrap();
    let parsed = counter::Counter::try_deserialize(&mut account.data.as_slice()).unwrap();
    assert_eq!(parsed.count, 1);
    assert_eq!(parsed.authority, authority.pubkey());
}
```

**For this test to fail, either `initialize` would have to leave the account uninitialized or mis-attributed, or `increment` would have to miscompute the running count: any of those bugs and the final `assert_eq!` catches a number that isn't `1`.**

And here's the test whose entire purpose is to watch the program say no:

```rust
#[test]
fn increment_fails_when_wrong_authority_signs() {
    let (mut svm, program_id) = setup_svm_with_program();

    let authority_a = Keypair::new();
    let authority_b = Keypair::new();
    svm.airdrop(&authority_a.pubkey(), 1_000_000_000).unwrap();
    svm.airdrop(&authority_b.pubkey(), 1_000_000_000).unwrap();
    let counter = Keypair::new();

    // authority_a creates the counter. This must succeed.
    let init_tx = build_initialize_tx(&svm, program_id, &authority_a, &counter);
    svm.send_transaction(init_tx).expect("initialize should succeed");

    // authority_b tries to increment it. This must fail.
    let bad_tx = build_increment_tx(&svm, program_id, &authority_b, counter.pubkey());
    let result = svm.send_transaction(bad_tx);
    assert!(result.is_err(), "increment should fail when signed by the wrong authority");
}
```

**For this test to fail, the `has_one = authority` check would have to let a stranger's signature through, which is exactly the regression I re-created, on purpose, the very next day.**

## Day 61: the bug I planted and the test that caught it

Day 61 wasn't about writing new code. It was about breaking working code on purpose, three separate ways, to prove the test suite wasn't just green by accident. Of the three experiments, one mattered more than the others.

I opened `Increment` and deleted `has_one = authority`, leaving only `#[account(mut)]`:

```rust
// before
#[account(mut, has_one = authority)]
pub counter: Account<'info, Counter>,

// after, the authorization check is gone
#[account(mut)]
pub counter: Account<'info, Counter>,
```

Rebuilt, reran the suite, and watched it turn red exactly where it should have:

```
running 3 tests
test increment_fails_when_wrong_authority_signs ... FAILED
test initialize_then_increment ... FAILED
test initialize_fails_when_counter_already_exists ... ok

---- increment_fails_when_wrong_authority_signs stdout ----
thread 'increment_fails_when_wrong_authority_signs' panicked at programs/counter/tests/counter.rs:150:5:
increment should fail when signed by the wrong authority

test result: FAILED. 1 passed; 2 failed; 0 ignored; 0 measured; 0 filtered out
```

That's the whole point of the day, right there in one panic message. Without that constraint, anyone holding any keypair could increment anyone else's counter, and the program would have happily let them. With the constraint gone, my own test, the one I'd written specifically to distrust the wrong wallet, refused to pass. Nothing about the *code* told me this was broken; it built cleanly and would have deployed fine. Only the test that was built to fail on an unauthorized call actually noticed.

I put `has_one = authority` back, rebuilt, and reran:

```
test increment_fails_when_wrong_authority_signs ... ok
test initialize_then_increment ... ok
test initialize_fails_when_counter_already_exists ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Green again. The other two experiments, flipping `checked_add(1)` to `checked_add(2)` and commenting out the line that stamps `authority` during `initialize`, were just as instructive in a quieter way: one turned a passing assertion into a clean `left: 2, right: 1` mismatch, and the other proved that a bug can live in one instruction while the *error* surfaces in a completely different one (the missing-authority bug didn't fail until `increment` ran and compared a real wallet against `11111...1111`, the zeroed default). But the deleted constraint is the one I'd genuinely be nervous about shipping unnoticed.

**If I had another week:** I'd stop asserting only that a bad call "returned an error" and start asserting *which* error, matching on `ConstraintHasOne` specifically, the way the printed logs already showed me I could. A test that accepts any failure also accepts the wrong failure for the wrong reason, and Day 61 is exactly where I saw that gap.

---

*Written as part of #100DaysOfSolana. Code lives in the `counter` Anchor program tested end-to-end with LiteSVM: no validator, no RPC round-trips, sub-second runs.*
