# Day 71: My first CPI, moving SOL through the System Program

## Steps

1. Create a fresh Anchor project and move into it. This scaffolds the program, a default `Anchor.toml`, and the local config.

   ```bash
   anchor init sol-mover
   cd sol-mover
   ```

   Anchor 1.0 scaffolds `programs/sol-mover/src/lib.rs` along with helper modules (`constants.rs`, `error.rs`, `instructions/`, `state.rs`) and a Rust integration test at `programs/sol-mover/tests/test_initialize.rs`. I won't use any of them today, so I delete the Rust test directory so the build does not try to compile it against the instructions I'm about to replace:

   ```bash
   rm -rf programs/sol-mover/tests
   ```

2. Now open `programs/sol-mover/src/lib.rs`. Anchor generated a starter program with a `declare_id!("...")` line and a sample `initialize` instruction. Replace the file with the code below, with one important exception: keep the `declare_id!` line that Anchor wrote for me. That string is the unique on-chain address of the program. The one shown here is only a placeholder, and if the two ever drift apart I'll see a "declared program id does not match" error, which `anchor keys sync` fixes.

   ```rust
   use anchor_lang::prelude::*;
   use anchor_lang::system_program::{transfer, Transfer};

   declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // keep YOUR generated id, not this one

   #[program]
   pub mod sol_mover {
       use super::*;

       pub fn sol_transfer(ctx: Context<SolTransfer>, amount: u64) -> Result<()> {
           // Name the two accounts the System Program's transfer needs.
           let cpi_accounts = Transfer {
               from: ctx.accounts.sender.to_account_info(),
               to: ctx.accounts.recipient.to_account_info(),
           };

           // Bundle the target program with those accounts.
           let cpi_context = CpiContext::new(
               ctx.accounts.system_program.key(),
               cpi_accounts,
           );

           // Fire the cross-program invocation.
           transfer(cpi_context, amount)?;

           Ok(())
       }
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

   A quick note on the accounts struct: `sender` and `recipient` are both marked `mut` because both balances change. `sender` is a `Signer` because moving someone's SOL requires their authorization. And `system_program` has to be included in the struct, because to call a program over a CPI, that program has to be one of the accounts passed into the instruction.

   One detail about that `CpiContext::new` call: in Anchor 1.0 the first argument is the program id (a `Pubkey`), not the program's `AccountInfo`. That is why the code uses `system_program.key()`. Writing CPIs against an older Anchor and reflexively typing `.to_account_info()` will get flagged by the compiler with `expected Pubkey, found AccountInfo<'_>`.

3. Anchor 1.0 does not auto-create a TypeScript test for me, so I make the directory and the file myself:

   ```bash
   mkdir tests
   ```

   Open `tests/sol-mover.ts` and paste this test. It sends a quarter of a SOL through the new instruction and checks that the recipient actually received it.

   ```typescript
   import * as anchor from "@anchor-lang/core";
   import { Program, web3 } from "@anchor-lang/core";
   import { SolMover } from "../target/types/sol_mover";

   const { Keypair, LAMPORTS_PER_SOL } = web3;

   describe("sol-mover", () => {
     const provider = anchor.AnchorProvider.env();
     anchor.setProvider(provider);

     const program = anchor.workspace.SolMover as Program<SolMover>;
     const sender = provider.wallet;

     it("moves SOL with a CPI to the System Program", async () => {
       const recipient = Keypair.generate();
       const amount = new anchor.BN(0.25 * LAMPORTS_PER_SOL);

       const before = await provider.connection.getBalance(recipient.publicKey);

       const signature = await program.methods
         .solTransfer(amount)
         .accounts({
           sender: sender.publicKey,
           recipient: recipient.publicKey,
         })
         .rpc();

       const after = await provider.connection.getBalance(recipient.publicKey);

       console.log("Transaction signature:", signature);
       console.log(`Recipient went from ${before} to ${after} lamports`);

       if (after - before !== amount.toNumber()) {
         throw new Error("The recipient did not receive the expected amount of SOL");
       }
     });
   });
   ```

   Notice that the test passes only `sender` and `recipient` to `.accounts()`. `systemProgram` is never listed, because Anchor recognizes that account by name and fills it in automatically. The instruction name `sol_transfer` in Rust becomes `solTransfer` in TypeScript, and `anchor.workspace.SolMover` is just the PascalCase version of the program's name.

4. The default `Anchor.toml` Anchor 1.0 generates has `test = "cargo test"`, which would skip the TypeScript file entirely. Change the `[scripts]` block so `anchor test` runs the mocha file just written:

   ```toml
   [scripts]
   test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
   ```

## Run it

```bash
# from the sol-mover project root
anchor keys sync   # make declare_id! match the program keypair
anchor build       # compile the program and generate the IDL and TS types
anchor test        # start surfpool, deploy, and run the test
```

If I see a passing test and a log line where the recipient's balance jumped from 0 to 250000000 lamports, the program just moved real SOL through another program. That is the first CPI.

## Output

```text
9esojzrBee2KxMWkoCLFeLpUkHmWmuGv3ZEKDZic6XEU
yarn run v1.22.22
warning package.json: No license field
warning ../package.json: No license field
$ /mnt/c/Users/T_fonsec/solana/sol-mover/node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 'tests/**/*.ts'


  sol-mover
Transaction signature: UUbzmpshEA31PqZk88oWHYQWXtjunk3ua2wDUNHzaoLDDoftYUHbaZg7SdYdh25gZYLe39v6JvuiMys8qRZAa7b
Recipient went from 0 to 250000000 lamports
    ✔ moves SOL with a CPI to the System Program (345ms)


  1 passing (349ms)

Done in 18.53s.
```
