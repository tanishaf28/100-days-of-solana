# Day 72: A CPI into Token-2022 to mint tokens

## Steps

1. Scaffold the project and remove the Rust test I won't use:

   ```bash
   anchor init token_cpi
   cd token_cpi
   rm -rf programs/token_cpi/tests   # remove the scaffolded Rust test that references the deleted initialize instruction
   ```

2. Open `programs/token_cpi/Cargo.toml` and replace the existing `[dependencies]` block with these two lines so the program can use anchor-spl's token interface:

   ```toml
   [dependencies]
   anchor-lang = "1.0"
   anchor-spl = { version = "1.0", features = ["idl-build"] }
   ```

   If I'm on Anchor 0.31.x, use `"0.31.1"` for both crates and add `anchor-spl/idl-build` to the `idl-build` feature list in `[features]`.

3. Now replace `programs/token_cpi/src/lib.rs` with this handler. Keep the `declare_id!` line Anchor generated for me. Only the body changes.

   ```rust
   use anchor_lang::prelude::*;
   use anchor_spl::token_interface::{self, Mint, MintTo, TokenAccount, TokenInterface};

   declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // keep YOUR generated id

   #[program]
   pub mod token_cpi {
       use super::*;

       pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
           // The accounts Token-2022 needs in order to mint.
           let cpi_accounts = MintTo {
               mint: ctx.accounts.mint.to_account_info(),
               to: ctx.accounts.token_account.to_account_info(),
               authority: ctx.accounts.signer.to_account_info(),
           };

           // The program we are calling into, and the context that ties it together.
           // In Anchor 1.0 the first arg to CpiContext::new is a Pubkey, so use .key().
           let cpi_program = ctx.accounts.token_program.key();
           let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

           // The cross-program invocation. amount is in base units.
           token_interface::mint_to(cpi_ctx, amount)?;
           Ok(())
       }
   }

   #[derive(Accounts)]
   pub struct MintTokens<'info> {
       #[account(mut)]
       pub signer: Signer<'info>,
       #[account(mut)]
       pub mint: InterfaceAccount<'info, Mint>,
       #[account(mut)]
       pub token_account: InterfaceAccount<'info, TokenAccount>,
       pub token_program: Interface<'info, TokenInterface>,
   }
   ```

   A few things worth naming. `MintTo` is the accounts struct that the token program's mint instruction expects: the mint to grow, the token account to receive the new units, and the authority allowed to do it. `InterfaceAccount` and `Interface` are the Token-2022 aware versions of Anchor's account types, so the very same program would also work against the original Token Program without a rewrite. And nothing here checks a signature by hand: because `signer` is the mint authority and it signs the outer transaction, that signature flows through into the CPI automatically.

4. Build the program once so Anchor generates the IDL and TypeScript types the test will import:

   ```bash
   anchor build
   ```

   Anchor 1.0 does not auto-create a TypeScript test directory, so I make one. The Anchor 1.0 JS client (`@anchor-lang/core`) already ships with the scaffold, so I only need to add `@solana/spl-token` for the mint helpers:

   ```bash
   mkdir tests
   yarn add --dev @solana/spl-token
   ```

5. Create `tests/token_cpi.ts` with these imports at the top:

   ```typescript
   import * as anchor from "@anchor-lang/core";
   import { Program } from "@anchor-lang/core";
   import { TokenCpi } from "../target/types/token_cpi";
   import { strict as assert } from "assert";
   import {
     TOKEN_2022_PROGRAM_ID,
     createMint,
     getOrCreateAssociatedTokenAccount,
     getAccount,
   } from "@solana/spl-token";
   ```

   Then add the body of the test: a `describe` block, the provider setup, the program variable, and the `it(...)` block that actually exercises the CPI.

   ```typescript
   describe("token_cpi", () => {
     const provider = anchor.AnchorProvider.env();
     anchor.setProvider(provider);

     const program = anchor.workspace.TokenCpi as Program<TokenCpi>;

     it("mints Token-2022 tokens through the program", async () => {
       const payer = (provider.wallet as anchor.Wallet).payer;
       const connection = provider.connection;

       // 1. Create a Token-2022 mint. My wallet is the mint authority.
       const mint = await createMint(
         connection,
         payer,
         payer.publicKey, // mint authority
         null,            // no freeze authority
         9,               // decimals
         undefined,
         undefined,
         TOKEN_2022_PROGRAM_ID,
       );

       // 2. Create the destination token account my wallet owns.
       const ata = await getOrCreateAssociatedTokenAccount(
         connection,
         payer,
         mint,
         payer.publicKey,
         false,
         undefined,
         undefined,
         TOKEN_2022_PROGRAM_ID,
       );

       // 3. Ask MY program to mint. It runs the mint_to CPI for me.
       const amount = new anchor.BN(1_000_000_000); // 1 whole token at 9 decimals
       await program.methods
         .mintTokens(amount)
         .accountsPartial({
           signer: payer.publicKey,
           mint,
           tokenAccount: ata.address,
           tokenProgram: TOKEN_2022_PROGRAM_ID,
         })
         .rpc();

       // 4. Read the balance straight from the chain.
       const account = await getAccount(connection, ata.address, undefined, TOKEN_2022_PROGRAM_ID);
       console.log("Minted base units:", account.amount.toString());
       assert.equal(account.amount.toString(), amount.toString());
     });
   });
   ```

   The first two steps are ordinary setup: a mint exists, and a token account exists to hold the result. Step three is the whole point of the day. Instead of asking Token-2022 to mint directly, I call `mintTokens` on my program, and my program turns around and makes the CPI. The `tokenProgram` account passed in is what the handler reads as `ctx.accounts.token_program`, which is how the same code can target Token-2022 here and the classic Token Program elsewhere.

## Output

```text
program id: "tW9WxDs7dymUYnLF1CGxvEezt559y2Kdwj9xvDUo1uQ"
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/token_cpi$ anchor test --skip-local-validator
```
