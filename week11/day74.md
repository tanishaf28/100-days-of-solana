# Day 74: A CPI into my own second program

## Steps

1. Scaffold a fresh workspace, then add a second program to it. The first program (`compose_lab`) will be the caller; the one added (`counter`) will be the callee. Drop the orphaned Rust integration tests both programs scaffold, since today's lesson replaces the instructions they target:

   ```bash
   anchor init compose-lab
   cd compose-lab
   anchor new counter
   rm -rf programs/compose-lab/tests programs/counter/tests
   ```

2. Open `programs/counter/src/lib.rs` and write the callee. It holds a single number and exposes two instructions: one to create the account, one to add to it. Leave the `declare_id!` line exactly as `anchor new` generated it.

   ```rust
   use anchor_lang::prelude::*;

   declare_id!("..."); // keep the id anchor generated for me

   #[program]
   pub mod counter {
       use super::*;

       pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
           ctx.accounts.tally.count = 0;
           Ok(())
       }

       pub fn increment(ctx: Context<Increment>) -> Result<()> {
           ctx.accounts.tally.count += 1;
           msg!("counter is now {}", ctx.accounts.tally.count);
           Ok(())
       }
   }

   #[derive(Accounts)]
   pub struct Initialize<'info> {
       #[account(init, payer = payer, space = 8 + Tally::INIT_SPACE)]
       pub tally: Account<'info, Tally>,
       #[account(mut)]
       pub payer: Signer<'info>,
       pub system_program: Program<'info, System>,
   }

   #[derive(Accounts)]
   pub struct Increment<'info> {
       #[account(mut)]
       pub tally: Account<'info, Tally>,
   }

   #[account]
   #[derive(InitSpace)]
   pub struct Tally {
       pub count: u64,
   }
   ```

3. Build the workspace once, then hand the counter's interface to the caller. When I run `anchor build`, Anchor writes a JSON file to `target/idl/counter.json`. That file is the counter's IDL: the machine-readable description of its instructions and accounts, essentially the API contract for the program. Copy it into an `idls` folder, which is where the next step's macro looks for it.

   ```bash
   anchor build
   mkdir idls
   cp target/idl/counter.json idls/
   ```

   If a later build ever complains about a declared program id mismatch, run `anchor keys sync` and then `anchor build` again to realign the ids.

4. Now open `programs/compose-lab/src/lib.rs` and write the caller. The `declare_program!` macro reads `idls/counter.json` and generates a `cpi` module for the counter. That module hands me `cpi::increment` as a Rust function taking a `CpiContext`, exactly like the `transfer` and `mint_to` helpers called for the System Program and Token-2022. I build the `CpiContext` the same way all week, remembering that Anchor 1.0's first arg is the program's `Pubkey` (use `.key()`), not its `AccountInfo`.

   ```rust
   use anchor_lang::prelude::*;

   declare_program!(counter);

   use counter::{
       accounts::Tally,
       cpi::{self, accounts::Increment},
       program::Counter,
   };

   declare_id!("..."); // keep the id anchor generated for me

   #[program]
   pub mod compose_lab {
       use super::*;

       pub fn bump(ctx: Context<Bump>) -> Result<()> {
           let cpi_ctx = CpiContext::new(
               ctx.accounts.counter_program.key(),
               Increment {
                   tally: ctx.accounts.tally.to_account_info(),
               },
           );
           cpi::increment(cpi_ctx)?;
           Ok(())
       }
   }

   #[derive(Accounts)]
   pub struct Bump<'info> {
       #[account(mut)]
       pub tally: Account<'info, Tally>,
       pub counter_program: Program<'info, Counter>,
   }
   ```

   Notice the two roles the generated code plays: `Increment` is the accounts struct the counter expects, and `Program<'info, Counter>` validates that the program being called really is the counter and not an impostor at a different address.

5. Anchor 1.0 does not auto-create a TypeScript test directory, so I make one. Everything this test imports (the Anchor 1.0 JS client `@anchor-lang/core`, and chai) already ships with the scaffold, so there's nothing extra to install:

   ```bash
   mkdir tests
   ```

   Create `tests/compose-lab.ts` with the content below. It creates a fresh tally account by calling the counter's `initialize` directly, then calls `bump` on the caller, which reaches across to the counter through the CPI. The assertion checks the count even though the test never touched `increment` itself.

   ```typescript
   import * as anchor from "@anchor-lang/core";
   import { Program, web3 } from "@anchor-lang/core";
   import { assert } from "chai";
   import { Counter } from "../target/types/counter";
   import { ComposeLab } from "../target/types/compose_lab";

   const { Keypair, SystemProgram } = web3;

   describe("compose-lab", () => {
     const provider = anchor.AnchorProvider.env();
     anchor.setProvider(provider);

     const counter = anchor.workspace.Counter as Program<Counter>;
     const caller = anchor.workspace.ComposeLab as Program<ComposeLab>;

     it("the caller bumps the counter through a CPI", async () => {
       const tally = Keypair.generate();

       await counter.methods
         .initialize()
         .accounts({
           tally: tally.publicKey,
           payer: provider.wallet.publicKey,
           systemProgram: SystemProgram.programId,
         })
         .signers([tally])
         .rpc();

       await caller.methods
         .bump()
         .accounts({
           tally: tally.publicKey,
           counterProgram: counter.programId,
         })
         .rpc();

       const state = await counter.account.tally.fetch(tally.publicKey);
       assert.equal(state.count.toNumber(), 1);
       console.log("counter value set by the caller:", state.count.toNumber());
     });
   });
   ```

## Run it

Point the default `[scripts]` test in `Anchor.toml` at the mocha runner so `anchor test` actually executes the TypeScript file:

```toml
[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

```bash
anchor test
```

Anchor builds both programs, deploys them together to a surfpool validator, and runs the test. Watch for the green check and the logged line showing the counter sitting at 1.

## Output

```text
counterid: 91sLRYJo1JsyoasU9vQeZsSDoDG2PgrBuFMJ1bdGgFpm
composeid: AUAFUwnAvvAZh9AsfAHFyHUp8sEJiEwaQR8hUpPMXTPG

yarn run v1.22.22
warning package.json: No license field
warning ../package.json: No license field
$ /mnt/c/Users/T_fonsec/solana/compose-lab/node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 'tests/**/*.ts'


  compose-lab
counter value set by the caller: 1
    ✔ the caller bumps the counter through a CPI (553ms)


  1 passing (557ms)

Done in 18.90s.
```
