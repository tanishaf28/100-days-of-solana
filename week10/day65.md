# Day 65: A per-user counter program with PDAs

## Steps

1. Create a fresh Anchor workspace so I can see this program in isolation. Run `anchor init counter` and step into the new directory. Open `programs/counter/src/lib.rs`. Also delete the generated `programs/counter/tests/test_initialize.rs`: it tests an `Initialize` instruction this program does not have, so it will fail to compile and error out when the tests run.
2. Replace the contents of `lib.rs` with the program below. The `declare_id!("...")` line in the snippet is a placeholder; keep the pubkey that `anchor init` generated on the line that already exists in the file, since it is paired with the program keypair under `target/deploy/counter-keypair.json`. If I accidentally clobber it, no need to panic: step 6 shows how `anchor keys sync` puts both halves back in sync. Read the rest of the file before saving. Every line is doing work.

   ```rust
   use anchor_lang::prelude::*;

   declare_id!("YOUR_PROGRAM_ID_HERE");

   #[program]
   pub mod counter {
       use super::*;

       pub fn init_counter(ctx: Context<InitCounter>) -> Result<()> {
           let counter = &mut ctx.accounts.counter;
           counter.user = ctx.accounts.user.key();
           counter.count = 0;
           counter.bump = ctx.bumps.counter;
           Ok(())
       }

       pub fn increment(ctx: Context<Increment>) -> Result<()> {
           let counter = &mut ctx.accounts.counter;
           counter.count = counter
               .count
               .checked_add(1)
               .ok_or(CounterError::Overflow)?;
           Ok(())
       }
   }

   #[derive(Accounts)]
   pub struct InitCounter<'info> {
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

   #[derive(Accounts)]
   pub struct Increment<'info> {
       #[account(
           mut,
           seeds = [b"counter", user.key().as_ref()],
           bump = counter.bump,
       )]
       pub counter: Account<'info, Counter>,
       pub user: Signer<'info>,
   }

   #[account]
   #[derive(InitSpace)]
   pub struct Counter {
       pub user: Pubkey,
       pub count: u64,
       pub bump: u8,
   }

   #[error_code]
   pub enum CounterError {
       #[msg("counter overflow")]
       Overflow,
   }
   ```

   Look at the `InitCounter` struct. The `seeds` constraint says this counter's address is derived from the byte string `"counter"` and the signer's public key. The `bump` constraint asks Anchor to compute the canonical bump for me. The `init` constraint says "create this account if it does not exist," and `payer` and `space` say who is paying for rent and how many bytes to reserve.

   Now look at `Increment`. There is no `has_one`, no manual owner check, no signature gymnastics. The `seeds` constraint is the authorization. If someone other than the counter's owner calls `increment`, the seed derivation will produce a different address than the counter account they passed in, and Anchor will refuse the transaction before the handler runs. The keypair I do not own becomes the access control I do not have to write.

   Notice `8 + Counter::INIT_SPACE`. The `InitSpace` derive macro computes the byte size of the account data automatically, and the extra 8 bytes are for Anchor's discriminator, the prefix Anchor stamps on every account so it knows what type it is later. Forgetting that 8 is one of the most common ways to corrupt an account, so it's worth noticing.

3. Save the file, then run `anchor build` from the workspace root. The program ID in `declare_id!` and the one under `[programs.localnet]` in `Anchor.toml` should already match the keypair Anchor generated. If for any reason they have drifted apart (for example, running `anchor build` before pasting the program in), run `anchor keys sync` and Anchor will rewrite both sides. Then run `anchor build` one more time.
4. Create `tests/counter.ts` at the workspace root. Add a test that exercises both handlers and proves the per-user mapping works.

   ```typescript
   import * as anchor from "@anchor-lang/core";
   import { Program } from "@anchor-lang/core";
   import { Counter } from "../target/types/counter";
   import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
   import { assert } from "chai";

   describe("counter", () => {
     const provider = anchor.AnchorProvider.env();
     anchor.setProvider(provider);
     const program = anchor.workspace.Counter as Program<Counter>;

     const counterPda = (user: PublicKey) =>
       PublicKey.findProgramAddressSync(
         [Buffer.from("counter"), user.toBuffer()],
         program.programId
       )[0];

     it("creates a counter per user and increments independently", async () => {
       const alice = provider.wallet.publicKey;
       const bob = Keypair.generate();

       // fund bob so he can pay rent
       const sig = await provider.connection.requestAirdrop(
         bob.publicKey,
         2 * LAMPORTS_PER_SOL
       );
       const latest = await provider.connection.getLatestBlockhash();
       await provider.connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");

       await program.methods
         .initCounter()
         .accounts({ user: alice })
         .rpc();

       await program.methods
         .initCounter()
         .accounts({ user: bob.publicKey })
         .signers([bob])
         .rpc();

       await program.methods.increment().accounts({ user: alice }).rpc();
       await program.methods.increment().accounts({ user: alice }).rpc();
       await program.methods.increment().accounts({ user: bob.publicKey }).signers([bob]).rpc();

       const aliceState = await program.account.counter.fetch(counterPda(alice));
       const bobState = await program.account.counter.fetch(counterPda(bob.publicKey));

       assert.equal(aliceState.count.toNumber(), 2);
       assert.equal(bobState.count.toNumber(), 1);
       assert.ok(aliceState.user.equals(alice));
       assert.ok(bobState.user.equals(bob.publicKey));
     });
   });
   ```

   Read the test before running it. Two different signers, two different PDAs, derived from the same seed prefix and the signer's pubkey. Alice's counter does not know Bob exists. That is the whole point.

5. Point `anchor test` at the TypeScript test just written. Open `Anchor.toml` and look at the `[scripts]` section. The scaffold sets `test = "cargo test"`, which runs the Rust suite and ignores `tests/counter.ts` entirely. Replace that line so it runs `ts-mocha` instead:

   ```toml
   [scripts]
   test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
   ```

   `anchor test` may print a `MODULE_TYPELESS_PACKAGE_JSON` warning. It is harmless and the tests still pass. Adding `"type": "module"` to `package.json` silences it (that is optional), but if I do, I need to remember to remove it on Day 68, where it breaks the `ts-node` script.

## Output

```text
FWhNdTnHKC96jZugEAF62YS1n12GvAGdPZoNFmEkC7Mu

workaround:
terminal1
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ anchor test --skip-local-validator
    Finished `release` profile [optimized] target(s) in 4.06s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 9.76s
     Running unittests src/lib.rs (/mnt/c/Users/T_fonsec/solana/counter/target/debug/deps/counter-e2c12112a77e30cb)
Deploying cluster: http://127.0.0.1:8899
Upgrade authority: /home/t_fonsec/.config/solana/id.json
Deploying program "counter"...
Program path: /mnt/c/Users/T_fonsec/solana/counter/target/deploy/counter.so...
Program ID: FWhNdTnHKC96jZugEAF62YS1n12GvAGdPZoNFmEkC7Mu
Deploy success

Found a 'test' script in the Anchor.toml. Running it as a test suite!

Running test suite: "/mnt/c/Users/T_fonsec/solana/counter/Anchor.toml"

yarn run v1.22.22
warning ../package.json: No license field
$ /mnt/c/Users/T_fonsec/solana/counter/node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 'tests/**/*.ts'


  counter
    ✔ creates a counter per user and increments independently (2396ms)


  1 passing (2s)

Done in 20.46s.
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$

terminal2:
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ solana-test-validator \
  --ledger ~/solana-ledger \
  --rpc-port 8899 \
  --reset
```
