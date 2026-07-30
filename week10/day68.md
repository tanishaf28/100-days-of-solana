# Day 68: Exploring PDA collisions and seed spoofing

## The challenge

**What I'll need:**

- The Anchor counter project from Day 67 (per-user counter program plus the config singleton).
- The Anchor TypeScript client (`@anchor-lang/core`) and `@solana/web3.js` already installed in `package.json` (Anchor scaffolds both).
- A terminal, my editor, and a funded wallet at `~/.config/solana/id.json`.
- Ten quiet minutes. This day is for noticing, not shipping.

I'll start a local validator, deploy the program, and initialize the config singleton in the "Set up the cluster" section below before running the script.

## Steps

1. In the counter project, create a new file at `scripts/explore-collisions.ts`. The whole script lives inside one async function `main()` because the default Anchor `tsconfig.json` targets CommonJS, which does not allow top-level `await`. The plan: derive PDAs and print them, then attempt one deliberately-broken transaction.
2. Set up the imports and the `main` shell. Inside `main`, set up the program, my wallet, and a throwaway second wallet. I need the full `Keypair` (not just the pubkey) because I will fund it and initialize a counter for it on chain, so the spoof attempt at the end of the script fails on the seed constraint rather than on "account not initialized."

   ```typescript
   import * as anchor from "@anchor-lang/core";
   import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
   import { Counter } from "../target/types/counter";

   async function main() {
     const provider = anchor.AnchorProvider.env();
     anchor.setProvider(provider);

     const program = anchor.workspace.Counter as anchor.Program<Counter>;
     const walletA = provider.wallet.publicKey;
     const walletB = Keypair.generate();

     console.log("Program ID:", program.programId.toBase58());
     console.log("Wallet A:  ", walletA.toBase58());
     console.log("Wallet B:  ", walletB.publicKey.toBase58());

     // Fund walletB and init its counter so its PDA actually holds data on chain.
     const sig = await provider.connection.requestAirdrop(
       walletB.publicKey,
       2 * LAMPORTS_PER_SOL
     );
     const latest = await provider.connection.getLatestBlockhash();
     await provider.connection.confirmTransaction(
       { signature: sig, ...latest },
       "confirmed"
     );
     await program.methods
       .initCounter()
       .accounts({ user: walletB.publicKey })
       .signers([walletB])
       .rpc();

     // (the rest of this lesson's snippets all go here, in order)
   }

   main().catch((err) => {
     console.error(err);
     process.exit(1);
   });
   ```

3. Inside `main`, derive the per-user counter PDA for each wallet using exactly the seeds the program expects. These two addresses must be different. If they were the same, the program would have no way to keep one user's count from clobbering another's.

   ```typescript
   const [pdaA] = PublicKey.findProgramAddressSync(
     [Buffer.from("counter"), walletA.toBuffer()],
     program.programId
   );
   const [pdaB] = PublicKey.findProgramAddressSync(
     [Buffer.from("counter"), walletB.publicKey.toBuffer()],
     program.programId
   );

   console.log("\nPer-user counter PDAs");
   console.log("  Wallet A PDA:", pdaA.toBase58());
   console.log("  Wallet B PDA:", pdaB.toBase58());
   console.log("  Same address?", pdaA.equals(pdaB));
   ```

4. Still inside `main`, derive a hypothetical "global counter" PDA using only the static seed, with no wallet mixed in. This is the address every caller would land on if the seeds had been written as `[b"counter"]` instead of `[b"counter", user.key().as_ref()]`.

   ```typescript
   const [pdaGlobalFromA] = PublicKey.findProgramAddressSync(
     [Buffer.from("counter")],
     program.programId
   );
   const [pdaGlobalFromB] = PublicKey.findProgramAddressSync(
     [Buffer.from("counter")],
     program.programId
   );

   console.log("\nGlobal counter PDA (no wallet in seeds)");
   console.log("  Derived from A's perspective:", pdaGlobalFromA.toBase58());
   console.log("  Derived from B's perspective:", pdaGlobalFromB.toBase58());
   console.log("  Same address?", pdaGlobalFromA.equals(pdaGlobalFromB));
   ```

   Save and read the output once. The per-user PDAs differ. The global PDA does not. Same seeds, same program ID, same address, every time, for every caller. If the program used those seeds, only the first wallet to call `init_counter` would ever own a counter; everyone after that would hit "account already in use" because the system program refuses to create the same address twice.

5. Test a few near-misses. PDAs are deterministic hashes, so a single byte difference in the seeds gives a wildly different address. Try a longer seed, a trailing null byte, and the wrong static label.

   ```typescript
   const variants: [string, Buffer[]][] = [
     ['["counter", walletA]',     [Buffer.from("counter"),   walletA.toBuffer()]],
     ['["counters", walletA]',    [Buffer.from("counters"),  walletA.toBuffer()]],
     ['["counter\\0", walletA]',  [Buffer.from("counter\0"), walletA.toBuffer()]],
     ['["Counter", walletA]',     [Buffer.from("Counter"),   walletA.toBuffer()]],
   ];

   console.log("\nNear-miss seed variants");
   for (const [label, seeds] of variants) {
     const [pda] = PublicKey.findProgramAddressSync(seeds, program.programId);
     console.log(`  ${label.padEnd(28)} -> ${pda.toBase58()}`);
   }
   ```

   Every line should print a different address. There is no "close enough" in PDA-land. Either the seeds match exactly, or I get a stranger.

6. Now the runtime check. Try to spoof a PDA: from Wallet A, attempt to increment while passing Wallet B's PDA as the counter account. The program's `#[account(seeds = [b"counter", user.key().as_ref()], bump)]` constraint will try to re-derive the address from my signer and confirm it matches the one supplied. It will not.

   ```typescript
   console.log("\nAttempting to spoof a PDA...");
   try {
     await program.methods
       .increment()
       .accounts({
         counter: pdaB,
         user: walletA,
       })
       .rpc();
     console.log("  Spoof succeeded (this should NOT happen)");
   } catch (err) {
     console.log("  Spoof rejected:", (err as Error).message.split("\n")[0]);
   }
   ```

## Set up the cluster

The script talks to a deployed program and expects the config singleton to already exist. I do these three things first, in order.

1. Start a local validator and leave it running in its own terminal:

   ```bash
   solana-test-validator
   ```

2. Deploy the program to it from the project root:

   ```bash
   anchor deploy
   ```

3. Initialize the config once. Create `scripts/init-config.ts`:

   ```typescript
   import * as anchor from "@anchor-lang/core";
   import { Counter } from "../target/types/counter";

   (async () => {
     const provider = anchor.AnchorProvider.env();
     anchor.setProvider(provider);
     const program = anchor.workspace.Counter as anchor.Program<Counter>;
     await program.methods.initConfig().rpc();
     console.log("config initialized");
   })();
   ```

   Run it once:

   ```bash
   ANCHOR_PROVIDER_URL="http://127.0.0.1:8899" ANCHOR_WALLET="$HOME/.config/solana/id.json" \
     npx ts-node --transpile-only scripts/init-config.ts
   ```

   If the config already exists from an earlier run, the call fails with a `Simulation failed.` message and an `already in use` line in the program logs; that is fine, it means the singleton is already there. Move on.

## Run it

Invoke `ts-node` directly (Anchor's template already pulls it in transitively through `ts-mocha`). The `--transpile-only` flag skips whole-program type checking, which is what I want here because the default Anchor `tsconfig.json` only declares mocha and chai types and will otherwise complain about `Buffer` and `console`:

```bash
ANCHOR_PROVIDER_URL="http://127.0.0.1:8899" ANCHOR_WALLET="$HOME/.config/solana/id.json" \
  npx ts-node --transpile-only scripts/explore-collisions.ts
```

Unlike `anchor test` and `anchor run`, invoking `ts-node` directly means nothing sets up the Anchor provider automatically, so `AnchorProvider.env()` reads the cluster URL and wallet from these two environment variables. Without them I get `ANCHOR_PROVIDER_URL is not defined`. The URL points at the local validator from the prerequisites above (use a devnet URL instead if that is where the program is deployed).

If I get `Cannot find module .../target/types/counter`, check that `package.json` does not have `"type": "module"`. That setting switches `ts-node` to the ESM loader, which rejects the script's extensionless relative import. Removing it lets the script run.

## Output

```text
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ ANCHOR_PROVIDER_URL="http://127.0.0.1:8899" \
ANCHOR_WALLET="$HOME/.config/solana/id.json" \
npx ts-node --transpile-only scripts/explore-collisions.ts
Program ID: FWhNdTnHKC96jZugEAF62YS1n12GvAGdPZoNFmEkC7Mu
Wallet A:   DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
Wallet B:   4adFADb9y72E41em3xVR8xZYZhiUcEEs4JWdgY6Tj9WF

Per-user counter PDAs
Wallet A PDA: 3XhRGqC5TkQscnwjxvswvcQrBoYm2jVYJSvtSF1Tin6L
Wallet B PDA: 7JgAa3V6w1zLqJgqD3XXR45JZFinMGxGD71HmutEF9vg
Same address? false

Global counter PDA (no wallet in seeds)
  Derived from A's perspective: 74vVX5YDPdYykhAm44WjpqyKLtFBXEZ7qCYsyzL54k2B
  Derived from B's perspective: 74vVX5YDPdYykhAm44WjpqyKLtFBXEZ7qCYsyzL54k2B
  Same address? true

Near-miss seed variants
  ["counter", walletA]         -> 3XhRGqC5TkQscnwjxvswvcQrBoYm2jVYJSvtSF1Tin6L
  ["counters", walletA]        -> B8YPkzWUej7waA6gYTjWWgVPH1vN3tS9VtR2m439Jh9D
  ["counter\0", walletA]       -> EKwePFqBGTb92ntPMxAjndvqhiT3PQv96F7jVZKZsYpn
  ["Counter", walletA]         -> AyVnF2mVVGwMMsK1qD4cd7hK62dFWNd8iHZ7hz1yyDW

Attempting to spoof a PDA...
  Spoof rejected: AnchorError caused by account: config. Error Code: Paused. Error Number: 6001. Error Message: Increments are currently paused.
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$
```

## What just happened

I watched a seed array behave like a database compound key. `[b"counter", user.key().as_ref()]` is effectively `(table_name, user_id)`, and just like a relational unique index, it carves the address space into one row per user. Drop the user from the seeds and there is one global row that every caller competes for, with the system program acting as the bouncer who lets exactly one wallet through the door. PDAs do not have collisions in the cryptographic sense; sha256 makes engineering two distinct seed inputs to the same address infeasible. The collisions that actually hurt are the ones written on purpose, by leaving identity out of the seeds and only noticing once the second user complains.

The spoof attempt is the other half of the lesson. Anchor's `seeds` and `bump` constraints are not just for derivation, they are also a verifier. When Wallet A passed Wallet B's PDA into `increment`, Anchor re-derived the expected address from Wallet A's signer and compared it to what was sent. The mismatch produced a `ConstraintSeeds` error before any business logic ran. That check is the reason the counter program can trust the account it was handed without a manual ownership lookup.

I did not change a single line of on-chain code today. I only changed what I asked the derivation function for, and learned more about the program's safety surface than another instruction would have taught.
