---
title: "The Solana Security Checklist I Wish I'd Had Before I Reproduced the Wormhole Bug Myself"
published: true
tags: 100DaysOfSolana, solana, security, rust
---

This is a pre-deploy checklist I now run top to bottom before any Anchor program of mine touches mainnet. Every item below is a bug I reproduced myself over the last week (an account I forged, a signer I faked, a balance I underflowed on purpose), not a rule copied out of someone else's audit template. If you're a few weeks into Anchor and wondering what "think like an attacker" actually means in practice, run this list against your own program and see what fails.

How to use it: go top to bottom before every deploy. Each item should be answerable with a plain yes or no against a real line of your code. If you can't point at the line, it's a no.

## 1. Account validation

- [ ] Every deserialized account has its owner verified: a typed `Account<'info, T>` does this automatically, a raw `UncheckedAccount<'info>` does not, and reading its bytes by hand skips the check entirely.
- [ ] Account types are distinguished by their 8-byte discriminator, so one account shape can't be handed in where another is expected.
- [ ] Every PDA is checked against `seeds` + a **stored, canonical** bump, not re-derived loosely or trusted because it merely landed off-curve.

This category is the one I'd put first even if the challenge didn't ask me to, because I watched it fail in the most literal way possible. On Day 82 I rebuilt the mechanism behind two real incidents: $326M left the Wormhole bridge in February 2022, and roughly $52M left Cashio weeks later, both because a program accepted an account's data without ever checking who owned it. I wrote `leaky_vault`, an intentionally vulnerable program whose `Withdraw` instruction took `config: UncheckedAccount<'info>` and deserialized it by hand. Then I forged a `Config` account (same 8-byte discriminator, `admin` field set to my own attacker keypair, `owner` set to the System Program instead of my vault program), and the withdrawal sailed through:

```rust
// VULNERABLE: reads bytes without ever checking who owns the account.
let data = ctx.accounts.config.try_borrow_data()?;
let config = Config::try_deserialize(&mut &data[..])?;
require_keys_eq!(config.admin, ctx.accounts.signer.key(), VaultError::Unauthorized);
```

The fix was one type change, not new logic:

```rust
// Account<'info, T> checks ownership BEFORE deserializing.
pub config: Account<'info, Config>,
```

Same attack, same test, rebuilt after the fix: `AccountOwnedByWrongProgram`, rejected before my authorization check ever ran. I didn't write a smarter check. I let the framework enforce an assumption I'd left undeclared.

## 2. Authority and signer checks

- [ ] Every privileged instruction confirms the expected signer with `Signer<'info>`, not a pubkey comparison alone.
- [ ] No instruction trusts a stored `Pubkey` field as proof of identity. Comparing a key only proves someone *knew* a public key, and public keys are public; it doesn't prove they hold the matching private key.
- [ ] Where an account's stored authority must match the live caller, `has_one` (or an equivalent `constraint =`) enforces it in the struct, not in an `if` buried in the handler body.

My own Day 78 audit caught exactly the gap the checklist item above describes, in a struct I hadn't written myself:

```rust
#[derive(Accounts)]
pub struct UpdateProfile<'info> {
    #[account(mut, has_one = authority)]
    pub profile: Account<'info, Profile>,
    /// CHECK: compared to profile.authority via has_one
    pub authority: UncheckedAccount<'info>,
}
```

`has_one` binds the field, but `authority` is an `UncheckedAccount`, so nothing ever confirmed the caller *signed* as that key. On Day 80 I proved the flip side works when the type is right: a `vault` PDA derived as `seeds = [b"vault", authority.key().as_ref()]` meant an attacker signing as themselves and pointing `authority` at the real owner still failed, because the PDA that derivation produces for *their* key doesn't match the vault they're trying to touch. `attacker_cannot_withdraw_with_wrong_authority` came back `ConstraintSeeds`, code 2006, before my handler logic ever ran.

## 3. Arithmetic safety

- [ ] Every balance or supply change uses `checked_add` / `checked_sub` / `checked_mul`, never raw `+`, `-`, `*` on a value an attacker influences.
- [ ] `overflow-checks = true` is set under `[profile.release]` in the workspace root `Cargo.toml`. Anchor sets this for you on `anchor init`, but it's worth confirming by hand if you assembled the workspace manually.
- [ ] At least one arithmetic invariant is property-tested, not just checked against a handful of hand-picked examples.

`checked_sub` is what turned a legitimate-but-greedy withdrawal into a clean, named failure instead of a wrapped `u64` and a ruined balance:

```rust
vault.balance = vault.balance.checked_sub(amount).ok_or(VaultError::InsufficientFunds)?;
```

`overdraw_underflows_safely` confirmed it: asking to withdraw 1,000 against a balance of 100 returned my own error code (6000), not a silent wraparound. But example tests only prove the inputs you thought to write. On Day 81 I pulled the deposit math into a pure function and proved a property instead of an example: *for every* `u64` pair `proptest` generates, a deposit either grows the balance or refuses honestly, with no third option where it silently wraps to something tiny.

```rust
proptest! {
    #[test]
    fn deposit_never_shrinks_a_balance(balance in any::<u64>(), amount in any::<u64>()) {
        match apply_deposit(balance, amount) {
            Some(new_balance) => prop_assert!(new_balance >= balance),
            None => prop_assert!(balance.checked_add(amount).is_none()),
        }
    }
}
```

Then I ran the same invariant through Trident, fuzzing full instruction sequences against a live in-process VM instead of a pure function: 100,000 generated `Deposit` calls, zero failures, zero panics. The trap worth flagging here is a quiet one: `trident init` scaffolds an empty `#[flow]` stub, and an empty flow means Trident invokes nothing and prints an empty table. That's a green run that tested zero transactions. Read the summary table, not just the word "completed": you want a non-zero `Invoked Total` before you trust the result.

## 4. CPI safety

- [ ] Every CPI verifies the target program ID is the one you actually intend, not whatever `Program<'info, T>` account happens to be passed in.
- [ ] Accounts are reloaded (`.reload()`) if their data is read again after a CPI mutates them.

This is the one gap in Anchor's type system I ran into directly, back in Arc 11. `CpiContext::new(program_id, accounts)` looks the same no matter which program you're calling: same shape for the System Program, for Token-2022, for a second Anchor program of my own. That consistency is genuinely useful, but it means the compiler has nothing to say if you pass the *wrong* program: `.key()` on any `Program<'info, T>` type-checks identically regardless of which program it points to. I swapped `counter_program.key()` for `system_program.key()` in a CPI that was supposed to call my own `increment` instruction, and it built cleanly. It just reached the real System Program with counter-shaped instruction data, which the System Program rejected as malformed: `invalid instruction data`. The type system protects the *shape* of a CPI, never the *destination*. Only I can get that part right, every time, by hand.

## 5. Account lifecycle

- [ ] Closed accounts are actually drained (`close = <account>`) and access-gated (`has_one` on the closer), so they can't be revived or closed by a stranger.
- [ ] No instruction allows reinitializing an already-initialized account. Anchor's `init` constraint refuses to write to an address the System Program reports as already in use, and that refusal is the security control, not an inconvenience to work around.
- [ ] Every seed that should make a PDA belong to one specific caller actually includes that caller's key. A missing identity seed doesn't just risk collisions, it turns a per-user account into one shared account every user is silently fighting over.
- [ ] Only the canonical bump (the one Anchor found and you stored at `init` time) is ever trusted on later instructions; re-derive nothing you already wrote down.

`close = user` on my counter's `CloseCounter` struct did three things in one attribute: drained the account's lamports back to `user`, zeroed its data, and marked it for cleanup, and `has_one = user` sitting right next to it meant a stranger couldn't close (and collect the rent refund from) somebody else's counter. The test confirmed both halves: `getAccountInfo` on the closed PDA came back `null`, and the rent lamports landed back in the closer's wallet, not a random one. Separately, I once wrote a PDA's seeds without the user's key in them, `seeds = [b"counter"]` instead of `seeds = [b"counter", user.key().as_ref()]`, and watched the first caller succeed and every caller after that hit `already in use`, because I'd accidentally built a global singleton and called it a per-user account.

## 6. Pre-deploy hygiene

- [ ] Dependencies are current and free of known advisories (`cargo audit`).
- [ ] Adversarial tests pass. For each instruction, at least one test where the wrong signer, a substituted account, or an out-of-range amount is expected to fail, and the assertion checks *which* error came back, not just that something did.
- [ ] Fuzz and property tests pass with a non-zero invocation count, not an empty scaffold mistaken for a clean run.
- [ ] A manual account inventory has been run against every `#[derive(Accounts)]` struct: list every field, classify it (`Signer`, `Account<T>`, `Program<T>`, or `UncheckedAccount`), and confirm this comes back empty or fully explained:

  ```
  grep -rn "UncheckedAccount\|AccountInfo\|/// CHECK" programs/*/src
  ```

  On a well-built program this returns nothing. Every hit that isn't nothing is a place Anchor stepped back and handed you the responsibility by hand, so cross-reference it against your findings before you deploy, not after.

## A closing note

This list is not complete, and I don't think a security checklist ever finishes: it's the record of every assumption I've caught myself leaving undeclared so far, and the next bug I reproduce will add a line I don't have yet. If you run this against your own program and find a gap it doesn't cover, or a check here that's wrong, I'd genuinely like to hear about it.

Sources and further reading: the [Ackee Blockchain Wormhole breakdown](https://ackeeblockchain.com/blog/wormhole-exploit-explained/), the [Halborn Wormhole analysis](https://www.halborn.com/blog/post/explained-the-wormhole-hack-february-2022), the [Sealevel Attacks](https://github.com/coral-xyz/sealevel-attacks) catalog of Solana-specific vulnerability classes, and the [Anchor book](https://www.anchor-lang.com/docs) for the constraint reference underneath most of the fixes above.

*Written as part of #100DaysOfSolana, drawing on Days 78–82: the manual account audit, hardening a withdraw instruction with constraints, adversarial LiteSVM tests, property and fuzz testing with proptest and Trident, and rebuilding the Wormhole/Cashio owner-check bug from scratch.*
