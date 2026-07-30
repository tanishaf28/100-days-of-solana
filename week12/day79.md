# Day 79: Hardening a Withdraw Instruction with Constraints

## Step 1: Name the footguns in a concrete instruction

Here's a deliberately under-constrained withdraw instruction. It's the kind of thing that compiles, passes a happy-path test, and quietly hands an attacker someone else's funds. Read it with yesterday's two audit questions in mind.

```rust
// INSECURE, do not ship this
#[derive(Accounts)]
pub struct Withdraw<'info> {
    pub authority: Signer<'info>,

    #[account(mut)]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}
```

The good news from yesterday's audit: `Signer<'info>` already answers the signer question for `authority`, and `Account<'info, Vault>` already answers the owner question for `vault`, because that type makes Anchor verify the account is owned by the program and carries the right discriminator. The footgun that remains is the relationship between them. Nothing here checks that this particular vault belongs to this particular authority, and nothing checks that `vault` is the real program-derived address rather than some other `Vault` account an attacker initialized and funded as bait. An attacker signs as themselves, passes in the victim's vault, and the handler happily drains it.

## Step 2: Make the state account carry what the constraints need

For Anchor to check the vault-to-authority relationship, the `Vault` account has to store the authority it belongs to. And for the PDA check to use the canonical bump saved at initialization (a pattern from an earlier arc), store the bump too.

```rust
#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub bump: u8,
}
```

## Step 3: Add one constraint per question, on the account itself

Now rewrite the struct so each rule lives next to the account it governs. Three additions close every remaining gap.

```rust
// SECURE
#[derive(Accounts)]
pub struct Withdraw<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
        has_one = authority,
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}
```

Each line carries its weight:

- `seeds = [b"vault", authority.key().as_ref()]` with `bump = vault.bump` tells Anchor to re-derive the PDA from the signer's key and confirm the passed-in vault address matches exactly. An attacker can no longer substitute a different account, because only the vault derived from their own key will satisfy the derivation, and that vault is the one they're allowed to touch.
- `has_one = authority` checks that the `authority` field stored inside the `Vault` account equals the `authority` account in the struct. This binds the on-chain record to the live signer. If they ever diverge, the instruction fails before the handler runs.
- `mut` stays because the withdraw mutates the vault's lamports, and Anchor rejects any attempt to mutate an account not marked mutable.

With those three lines in place, any imperative checks that might have been written inside the handler (an `if vault.authority != authority.key()` guard, a manual `Pubkey::find_program_address` comparison) become redundant. Delete them. The struct is now the single, readable source of truth for what a valid `Withdraw` looks like.

## Step 4: Reach for the right constraint for each remaining account

Different accounts need different guards. Keep this short catalog next to the audit notes and apply the matching constraint to every account in every instruction being hardened. Each one supports a custom error with `@ MyError::Variant` so the failure reads clearly in the logs.

- **Bind an account to a field on another account:** `#[account(has_one = mint)]` checks `this_account.mint == mint.key()`. Use it for every "who does this belong to" relationship.
- **Pin an account to one exact address:** `#[account(address = crate::ADMIN_PUBKEY)]` rejects anything but that specific key. Use it for hardcoded admins or known program accounts.
- **Validate a PDA:** `#[account(seeds = [...], bump = state.bump)]` re-derives and confirms the address, as above.
- **Validate a token account's mint and owner:** `#[account(token::mint = mint, token::authority = authority)]` confirms an SPL token account holds the expected mint and is controlled by the expected authority. This is the constraint that stops an attacker from passing a token account for the wrong mint, exactly the kind of substitution the Sealevel attacks catalog documents.
- **Express any other rule:** `#[account(constraint = vault.balance >= amount @ VaultError::InsufficientFunds)]` takes an arbitrary boolean expression. Reserve this for conditions the typed constraints can't express.
- **Last resort, an unchecked account:** if a raw `UncheckedAccount<'info>` genuinely must be accepted, Anchor forces a `/// CHECK:` doc comment above it explaining why skipping validation is safe. Treat every `/// CHECK:` in the codebase as a flag for tomorrow's adversarial tests.

## Step 5: Confirm it still compiles

Constraints are generated into account-validation code at compile time, so a clean build confirms the attribute syntax is valid and the types line up. Whether the constraints actually fire against malicious input is what tomorrow's adversarial tests prove; today's win is a fully constrained struct that builds.

## Run it

```bash
anchor build
```

If the build fails, read the error: a missing field referenced by `has_one`, a bump not stored on the state account, or a seed that doesn't match the initialization code are the usual culprits, and each points straight at the line to fix.
