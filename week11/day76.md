---
title: "The Same Four Lines of Anchor Called Three Completely Different Programs"
published: true
tags: solana, rust, anchor, web3
---

A CPI is a function call with a guest list. `CpiContext::new(program_id, accounts)` *is* that guest list, and it looks identical whether you're handing it to the System Program, to Token-2022, or to a program you wrote yourself last week.

## The confusion

Going into Day 71, I expected cross-program invocations to be three separate skills: one way to move SOL, a different way to mint a token, and something else entirely for calling my own program. Three days and three working programs later, I noticed I'd written the same four-line shape every time. The only things that changed were which program ID I passed in and which accounts struct I built. That's the whole post.

## The mental model

Every CPI is built from the same three pieces, no matter what's on the other end:

1. **The program being called**, identified by its program ID. In `sol-mover` that's `ctx.accounts.system_program.key()`. In `token_cpi` it's `ctx.accounts.token_program.key()`. In `compose-lab` it's `ctx.accounts.counter_program.key()`. Same position in the code, three completely different destinations.
2. **The accounts that program needs**, passed through as a plain struct: `Transfer { from, to }` for a transfer, `MintTo { mint, to, authority }` for a mint, `Increment { tally }` for my own counter. I don't invent these fields; they mirror exactly what the *callee's* own `Accounts` struct expects, because that's what gets deserialized on the other side.
3. **The signer authority**: either a real wallet already signing the outer transaction (true for all three examples below), or, when the account that needs to "sign" is a PDA with no private key, the calling program signs on its behalf with `.with_signer(signer_seeds)`. That's Day 73's vault, a different post's thesis, but worth knowing the branch exists.

Get those three pieces right and `CpiContext::new(...)` does the rest.

## The code

Here's the smallest one, Day 71's `sol_transfer`:

```rust
pub fn sol_transfer(ctx: Context<SolTransfer>, amount: u64) -> Result<()> {
    let cpi_accounts = Transfer {
        from: ctx.accounts.sender.to_account_info(),
        to: ctx.accounts.recipient.to_account_info(),
    };
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.key(),
        cpi_accounts,
    );
    transfer(cpi_context, amount)?;
    Ok(())
}

#[derive(Accounts)]
pub struct SolTransfer<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(mut)]
    pub recipient: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}
```

Now line up just the `CpiContext::new(...)` call from all three days:

```rust
// Day 71: System Program
CpiContext::new(ctx.accounts.system_program.key(), cpi_accounts)
// Day 72: Token-2022
CpiContext::new(ctx.accounts.token_program.key(), cpi_accounts)
// Day 74: my own program
CpiContext::new(ctx.accounts.counter_program.key(), cpi_accounts)
```

Same function, same shape, three different worlds. `cpi_accounts` is a different type each time (`Transfer`, `MintTo`, `Increment`), but the pattern wrapping it never moves.

## What tripped me up

Day 75 was for breaking things on purpose. In `compose-lab`'s `Bump` handler, I swapped `ctx.accounts.counter_program.key()` for `ctx.accounts.system_program.key()`: one field, same line, wrong value.

```
Simulation failed.
Message: Transaction simulation failed: Error processing Instruction 0: invalid instruction data.
Logs:
[
  "Program AUAFUwnAvvAZh9AsfAHFyHUp8sEJiEwaQR8hUpPMXTPG invoke [1]",
  "Program log: Instruction: Bump",
  "Program 11111111111111111111111111111111 invoke [2]",
  "Program 11111111111111111111111111111111 failed: invalid instruction data",
]
```

The transaction still reached a real program (the actual System Program, at `1111...1111`) because `.key()` on any `Program<'info, T>` account type-checks identically no matter which program it points to, so the compiler had nothing to object to. What it couldn't reach was a sensible outcome: the instruction data was built by `cpi::increment(...)` for my counter program's format, and the System Program has no idea what to do with counter-shaped bytes, so it rejected them as malformed. The fix was one word, put `counter_program` back, but the lesson was that the type system protects the *shape* of a CPI, not its *destination*. Only I can get that part right.

## Where to go deeper

Anchor's own [cross-program invocation docs](https://www.anchor-lang.com/docs/cross-program-invocations) cover `CpiContext`, `invoke_signed`, and the PDA-signing branch I skipped over here. Solana's [CPI docs](https://solana.com/docs/core/cpi) are the layer underneath, worth reading once you want to know what `CpiContext::new` is actually assembling under the hood.

This post draws from Days 71–75 of #100DaysOfSolana: CPIs into the System Program, into Token-2022, and into a second Anchor program, plus the Day 75 failures that showed what each broken piece looks like from the outside.
