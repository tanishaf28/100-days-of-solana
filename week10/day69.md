---
title: "What I learned about PDAs in a week of building on Solana"
published: true
tags: solana, rust, anchor, webdev
---

On Solana, programs are stateless: a deployed program has no memory of its own between transactions, only the accounts it's handed. If your program needs to remember something per user, per game, per config, it needs a deterministic address it can find again later without storing that address anywhere. Program Derived Addresses (PDAs) are that address. This is the write-up of the week I spent learning to actually trust them.

## The mental model

The fastest way in is the Web2 analogy: a PDA is like a database primary key you can compute from a row's logical identity instead of looking it up. Give the function `(table_name, row_id)` and it hands you back the same key every time, with no round trip to the database first.

Push past the analogy and it starts to strain in useful ways. There is no table. A PDA isn't stored anywhere waiting to be found. It's derived on demand, fresh, every single time, by hashing your seeds together with your program's ID. That last part matters more than it sounds: because the program ID is baked into the hash, only *your* program can ever produce (and sign for) that exact address. The same seeds fed through a different program ID land on a completely different address. And the address you compute might not have an account behind it at all yet: derivation and existence are two separate questions. You can compute a PDA for a user who has never touched your program, and get back a perfectly valid address pointing at nothing.

## Anatomy of a derivation

Here's the canonical pattern, copied straight out of my program's `lib.rs`:

```rust
#[derive(Accounts)]
pub struct InitCounter<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, Config>,
    #[account(
        init,
        payer = user,
        space = 8 + Counter::INIT_SPACE,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

Focus on the `counter` account's `seeds`. `b"counter"` is a static prefix: a namespace, so this program can derive other kinds of accounts later without colliding with this one. `user.key().as_ref()` is the dynamic seed: the thing that makes this address belong to *this* wallet and no other. Anchor hashes those two seeds together with the program ID (the pubkey from `declare_id!`) to get a candidate address.

That candidate has to land *off* the ed25519 curve: a valid PDA is specifically an address with no corresponding private key, which is the whole point: nobody can forge a signature for it, only the program that derived it can act on its behalf. So the runtime tries a one-byte value called the bump, starting at 255 and counting down, hashing it in along with the seeds, until it finds a bump that pushes the result off the curve. The bump isn't magic, it's just "the first candidate byte, tried from 255 downward, that happened to produce an invalid public key." Each candidate has roughly a 50/50 shot of landing off-curve, so in practice you'll see 255 or 254 most of the time, with lower values showing up occasionally. I confirmed this by running `findProgramAddressSync` on the same seeds four times in a row: 254, 255, 255, 254, with the same seeds and same program producing the identical derived address byte-for-byte every time. Determinism, not the bump value, is the part you're supposed to rely on.

## Why the seeds matter

I proved this to myself with a script that derives the same PDA two different ways from my counter program. With `seeds = [b"counter", user.key().as_ref()]`, wallet A and wallet B get two different addresses:

```
Per-user counter PDAs
  Wallet A PDA: 3XhRGqC5TkQscnwjxvswvcQrBoYm2jVYJSvtSF1Tin6L
  Wallet B PDA: 7JgAa3V6w1zLqJgqD3XXR45JZFinMGxGD71HmutEF9vg
  Same address? false
```

Drop the user from the seeds (`seeds = [b"counter"]`) and every wallet derives the *same* address, no matter who's asking:

```
Global counter PDA (no wallet in seeds)
  Derived from A's perspective: 74vVX5YDPdYykhAm44WjpqyKLtFBXEZ7qCYsyzL54k2B
  Derived from B's perspective: 74vVX5YDPdYykhAm44WjpqyKLtFBXEZ7qCYsyzL54k2B
  Same address? true
```

Neither pattern is "correct" in the abstract; it depends what you're modeling. My program actually uses both, on purpose: `seeds = [b"config"]` with no dynamic seed is exactly right for the config account, because I want exactly one config for the whole program, an admin-controlled singleton. But if I'd written the *counter* seeds that way, the first wallet to call `init_counter` would succeed, and every wallet after that would hit "account already in use," because the system program refuses to create an account at an address that already exists. Leaving identity out of the seeds when you meant to keep it in isn't a subtle bug: it's a shared mutable counter every user is silently fighting over.

## What the bump buys you

`find_program_address` (what Anchor calls under the hood when you write a bare `bump` in the constraint) always returns the *canonical* bump: the highest valid one, found by counting down from 255. That's the only bump you should ever treat as valid, because seeds plus a non-canonical bump can still produce a valid off-curve address, just a different one than everyone expects. If your program doesn't pin itself to the canonical bump specifically, you've opened the door to a class of bugs where an attacker supplies a different-but-still-valid bump and gets a different PDA to slide through checks meant for the "real" one.

Anchor handles this for you almost invisibly: write `bump` on an `init` account and Anchor computes and stores the canonical bump; my `Counter` struct has a `bump: u8` field for exactly this, set once with `counter.bump = ctx.bumps.counter`. On every instruction after that, I don't write `bump` again; I write `bump = counter.bump`, re-passing the value I already stored instead of asking the runtime to re-derive it. Re-derivation means retrying up to 256 hashes in the worst case; reading a stored byte is free. There's no reason to pay for the search twice.

## The full lifecycle

Across the week, my program's data went through the same four moves every time:

1. **Derive:** `seeds = [b"counter", user.key().as_ref()]` computes the address before any account exists there.
2. **Initialize:** `init` at that address, with `payer = user` and `space = 8 + Counter::INIT_SPACE`. The payer's lamports cover **rent**: the SOL an account has to hold, proportional to its byte size, to stay alive on-chain rather than getting purged. Anchor's `8 +` prefix is the account discriminator, a tag Anchor stamps on every account so it can tell what type it's deserializing later. Forgetting it is a fast way to corrupt your account layout.
3. **Mutate:** later instructions pass `seeds = [...], bump = counter.bump` instead of `init`. Anchor re-derives the expected address from those seeds and checks it against the account you supplied; if a caller hands in the wrong PDA, the transaction fails before your handler logic ever runs. The seed constraint *is* the access control.
4. **Close:** `close = user` doesn't delete a row from a table. It zeroes the account's data, transfers its entire **lamport** balance (lamports are the smallest unit of SOL, the way cents are to dollars) back to the specified account, and marks it for garbage collection once the transaction finishes. That's the rent coming back to you. There's no Web2 analogy that captures "the money that was rented to keep this alive is now un-rented and the row is gone at the same instant." It's a Solana-specific idea and worth sitting with.

## What I would tell past me

- The program ID is baked into the derivation, not decoration. The exact same seeds run through two different programs produce two unrelated addresses: a PDA isn't "portable" the way a plain keypair is.
- A PDA can never sign for itself; it has no private key by construction. Only the program that derived it can sign on its behalf, and only by passing the same seeds (plus bump) into a CPI as "signer seeds." I spent longer than I'd like to admit expecting a PDA to behave like a wallet.
- `init_if_needed` looks like a convenience and is really a decision. It quietly changes what "this instruction" means depending on whether the account already exists. Reach for it deliberately, with a clear idea of what happens on each branch, not as a default because you didn't want to write two instructions.
- The bump being a `u8` field on my own struct, not something recomputed on the fly, was the detail that made the rest click. Storing it turns "trust me, I derived this correctly" into "check this one byte."

If you want to go past this post, the primary sources are worth your time: the [Solana docs page on PDAs](https://solana.com/docs/core/pda), the [Anchor book's section on PDAs](https://www.anchor-lang.com/docs), and the [Anchor crate docs](https://docs.rs/anchor-lang/latest/anchor_lang/). The counter program this post is built from lives in my [100 Days of Solana repo](https://github.com/tanishaf28/100-days-of-solana).

*Written as part of #100DaysOfSolana.*
