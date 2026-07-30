# Day 64: Deriving PDAs with findProgramAddressSync

## Steps

1. Open `Anchor.toml` and copy the program ID under `[programs.localnet]`. This is the same public key declared in `declare_id!` inside `lib.rs`. Both must match for any of this to work.
2. From the project root, create a new file called `scripts/derive-pda.ts`.
3. Paste the script below into that file, then replace `YOUR_PROGRAM_ID_HERE` with the program ID you copied:

   ```typescript
   import { PublicKey } from "@solana/web3.js";

   const programId = new PublicKey("YOUR_PROGRAM_ID_HERE");

   const [pda, bump] = PublicKey.findProgramAddressSync(
     [Buffer.from("counter")],
     programId
   );

   console.log("Seeds:        [\"counter\"]");
   console.log("Program ID:   ", programId.toBase58());
   console.log("PDA:          ", pda.toBase58());
   console.log("Canonical bump:", bump);
   ```

   Read the script before running it. The seed is a single byte string, `"counter"`. The function `findProgramAddressSync` hashes the seeds together with the program ID and a one-byte bump value, starting at 255 and counting down, until the hashed result lands at a point that is not on the ed25519 curve. The first bump that produces an off-curve address is the canonical bump, and that is the one returned.

4. Run the script with the command below and confirm the output:

   ```bash
   npx ts-node --transpile-only scripts/derive-pda.ts
   ```

   I should see a base58 PDA and a bump between 0 and 255. Roughly three out of four runs give 254 or 255 for a short seed list, with lower values like 252 or 253 showing up the rest of the time, because each candidate bump has about a fifty-fifty chance of landing on the curve.

5. Now change the seed. Edit the file so the seeds line reads:

   ```typescript
   [Buffer.from("counter"), Buffer.from("alice")],
   ```

   Run the script again. The PDA is completely different. The bump may also differ.

6. Change the second seed from `"alice"` to `"bob"` and run a third time. Different PDA again. Same program ID, same first seed, but a different namespace.
7. Finally, restore the seeds to just `[Buffer.from("counter")]`, run the script a fourth time, and verify that the address matches the first run byte for byte. Determinism is the entire point.

## Run it

```bash
npx ts-node --transpile-only scripts/derive-pda.ts
```

The `--transpile-only` flag tells `ts-node` to skip whole-program type checking and just run the file. Without it, the default Anchor `tsconfig.json` (which only pulls in mocha and chai types) will complain that `Buffer` and `console` are not defined.

## Output

```text
program id: HxtUYmnPb73bdujNSuMd8XCsX4yH2N6CPiwPz3LG5mqY

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ npx ts-node --transpile-only scripts/derive-pda.ts
Seeds:        ["counter"]
Program ID:    HxtUYmnPb73bdujNSuMd8XCsX4yH2N6CPiwPz3LG5mqY
PDA:           CtdMzDnPHjchr9j2LzzNHRR2JRm67xrNTpWW64DF2UYY
Canonical bump: 254
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ npx ts-node --transpile-only scripts/derive-pda.ts
Seeds:        ["counter"]
Program ID:    HxtUYmnPb73bdujNSuMd8XCsX4yH2N6CPiwPz3LG5mqY
PDA:           2zQ3Mw1odSabYSAWHg6oASu7ZWSzLM4JDUX12sUEM1TG
Canonical bump: 255
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ npx ts-node --transpile-only scripts/derive-pda.ts
Seeds:        ["counter"]
Program ID:    HxtUYmnPb73bdujNSuMd8XCsX4yH2N6CPiwPz3LG5mqY
PDA:           Huz8FjpHgnWXMrVZMgacXWv93CTyETSn4nhM17tAbTSN
Canonical bump: 255
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ npx ts-node --transpile-only scripts/derive-pda.ts
Seeds:        ["counter"]
Program ID:    HxtUYmnPb73bdujNSuMd8XCsX4yH2N6CPiwPz3LG5mqY
PDA:           CtdMzDnPHjchr9j2LzzNHRR2JRm67xrNTpWW64DF2UYY
Canonical bump: 254
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$
```
