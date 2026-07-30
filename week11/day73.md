# Day 73: A vault PDA that signs for itself

## Setup

```bash
anchor init vault
rm -rf programs/vault/tests
```

```text
program id: 9BxMV1hKv6gik97y98AtuFVXuDzYtcF6Lda8xveg4QBs
```

```bash
yarn add @anchor-lang/core
yarn add -D @types/mocha
yarn add @solana/spl-token

anchor build
anchor test --skip-local-validator
```

## Output

```text
$ /mnt/c/Users/T_fonsec/solana/vault/node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 'tests/**/*.ts'


  vault
vault after deposit: 500000000
vault after withdraw: 0
    ✔ deposits, then the program signs to withdraw (625ms)


  1 passing (630ms)

Done in 20.03s.
```

## Steps

1. **Write the two instructions.** Open the program's `lib.rs`. Keep the `declare_id!` line that Anchor already generated for the project (do not copy the placeholder below), and add the `deposit` and `withdraw` handlers. Notice the one difference that matters: `deposit` uses a plain `CpiContext::new` because the user already signed, while `withdraw` chains `.with_signer(...)` because the vault cannot sign for itself.

   ```rust
   use anchor_lang::prelude::*;
   use anchor_lang::system_program::{transfer, Transfer};

   declare_id!("YOUR_PROGRAM_ID_HERE"); // keep the id Anchor generated for the project

   #[program]
   pub mod vault {
       use super::*;

       pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
           // The user signed the outer transaction, so a plain CPI is enough.
           // Anchor 1.0's CpiContext::new takes the program's Pubkey (`.key()`),
           // not its AccountInfo, so use `.key()` here and on every CpiContext::new.
           let cpi_ctx = CpiContext::new(
               ctx.accounts.system_program.key(),
               Transfer {
                   from: ctx.accounts.user.to_account_info(),
                   to: ctx.accounts.vault.to_account_info(),
               },
           );
           transfer(cpi_ctx, amount)?;
           Ok(())
       }

       pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
           let user_key = ctx.accounts.user.key();
           let bump = ctx.bumps.vault;

           // The recipe for the vault: literal seed, owner key, canonical bump.
           let signer_seeds: &[&[&[u8]]] = &[&[b"vault", user_key.as_ref(), &[bump]]];

           // The vault has no private key, so the program signs for it.
           let cpi_ctx = CpiContext::new(
               ctx.accounts.system_program.key(),
               Transfer {
                   from: ctx.accounts.vault.to_account_info(),
                   to: ctx.accounts.user.to_account_info(),
               },
           )
           .with_signer(signer_seeds);

           transfer(cpi_ctx, amount)?;
           Ok(())
       }
   }
   ```

2. **Describe the accounts.** Both instructions use the same vault PDA, derived from the literal `b"vault"` and the user's public key. The vault is a `SystemAccount`: it is owned by the System Program and holds only lamports, which is exactly what lets the System Program move SOL back out of it later. `user` is marked `mut` in both structs because their balance changes, and a `Signer` so that only the vault's owner can deposit to or drain their own vault.

   ```rust
   #[derive(Accounts)]
   pub struct Deposit<'info> {
       #[account(mut)]
       pub user: Signer<'info>,

       #[account(
           mut,
           seeds = [b"vault", user.key().as_ref()],
           bump,
       )]
       pub vault: SystemAccount<'info>,

       pub system_program: Program<'info, System>,
   }

   #[derive(Accounts)]
   pub struct Withdraw<'info> {
       #[account(mut)]
       pub user: Signer<'info>,

       #[account(
           mut,
           seeds = [b"vault", user.key().as_ref()],
           bump,
       )]
       pub vault: SystemAccount<'info>,

       pub system_program: Program<'info, System>,
   }
   ```

   The `seeds` and `bump` on the account constraint tell Anchor how to find and validate the vault, and they give me `ctx.bumps.vault` for free: the canonical bump fed into `signer_seeds` above. The two have to match, because the runtime re-derives the address from exactly those pieces.

3. **Drive it from a test.** Anchor 1.0 does not auto-create a `tests/` directory, so I make one. Everything this test imports (the Anchor 1.0 JS client `@anchor-lang/core`, and chai) already ships with the scaffold, so there's nothing extra to install:

   ```bash
   mkdir tests
   ```

   Put the following in `tests/vault.ts`. It deposits half a SOL, prints the vault balance, then withdraws the same amount and asserts the vault has been emptied. The vault address is derived in TypeScript with the same seeds used on chain.

   ```typescript
   import * as anchor from "@anchor-lang/core";
   import { Program, web3 } from "@anchor-lang/core";
   import { Vault } from "../target/types/vault";
   import { assert } from "chai";

   const { PublicKey, SystemProgram, LAMPORTS_PER_SOL } = web3;

   describe("vault", () => {
     const provider = anchor.AnchorProvider.env();
     anchor.setProvider(provider);

     const program = anchor.workspace.Vault as Program<Vault>;
     const user = provider.wallet.publicKey;

     const [vault] = PublicKey.findProgramAddressSync(
       [Buffer.from("vault"), user.toBuffer()],
       program.programId
     );

     it("deposits, then the program signs to withdraw", async () => {
       const amount = new anchor.BN(0.5 * LAMPORTS_PER_SOL);

       await program.methods
         .deposit(amount)
         .accountsPartial({ user, vault, systemProgram: SystemProgram.programId })
         .rpc();

       console.log("vault after deposit:", await provider.connection.getBalance(vault));

       await program.methods
         .withdraw(amount)
         .accountsPartial({ user, vault, systemProgram: SystemProgram.programId })
         .rpc();

       const finalBalance = await provider.connection.getBalance(vault);
       console.log("vault after withdraw:", finalBalance);
       assert.equal(finalBalance, 0);
     });
   });
   ```

   One detail worth knowing: since Anchor 0.30, the typed client resolves PDAs, signers, and the System Program for me, so passing them through the plain `.accounts(...)` method causes a type error. I use `.accountsPartial(...)` when I want to list those accounts explicitly, as here for clarity.

   Finally, change the default `[scripts]` test in `Anchor.toml` so `anchor test` runs the mocha file instead of `cargo test`:

   ```toml
   [scripts]
   test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
   ```

## Run it

```bash
anchor build
anchor test
```
