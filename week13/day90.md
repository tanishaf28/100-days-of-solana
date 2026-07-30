---
title: "My Solana Launch Checklist (Rehearsed End to End on Devnet, Before It Ever Touches Real SOL)"
published: true
tags: solana, rust, anchor, webdev
---

Pilots run a checklist before every takeoff. Surgeons run one before every incision. Not because they forgot how to fly or operate, but because the cost of skipping one step under pressure is too high to trust to memory. A Solana mainnet deploy is the same kind of moment: irreversible actions, real value at stake, and a dozen small things that each seem obvious right up until the one you forget.

One honest note before this gets into the actual checklist: I built and rehearsed every step of this arc against devnet, running it with the exact discipline I would use for a mainnet-beta launch, but I have not yet pushed this specific program to mainnet with real SOL behind it. That's on purpose. The whole point of a checklist is that you want to have run it once, calmly, before the version of the run where mistakes cost money. Everywhere below, read "mainnet-beta" as "the cluster this checklist is written for," and read the proof at the bottom as "what the same command looks like against the devnet rehearsal."

## Why I'm writing this down

It's three weeks from now. There's a new program, smaller than the vault I just spent five days on, and it's about to go out. I open the terminal, and pause. What was the order again? Did I confirm the upgrade authority before or after the deploy? Did the IDL need publishing separately? Was there a flag I forgot last time that cost a failed transaction and a buffer account I had to go clean up?

That's exactly the gap a checklist closes. The knowledge is in my head today because I just did it. In three weeks it will have faded, and "I'll remember" is not a launch strategy.

## Phase 1: Pre-flight, on devnet

These are the steps that catch problems while they're still cheap to fix.

- [ ] Every test passes against the final program build, not an earlier one.
- [ ] The program has been run end to end on devnet, in the same order and with the same commands I'd use on mainnet, not just "it compiles."
- [ ] `anchor build` produces a fresh `target/deploy/vault.so`. Never deploy a stale build: rebuild so the bytecode being shipped is exactly the code just reviewed.
- [ ] `anchor keys sync`, so the `declare_id!` in the program matches the actual keypair in `target/deploy/vault-keypair.json`. If this changes anything, run `anchor build` once more so the embedded ID and the artifact agree. A mismatch here is one of the most common first-deploy failures.
- [ ] Measured the rent the deploy will cost before spending it. The bulk of a deploy's cost is the rent that keeps the program account rent-exempt, and it scales with the byte size of the compiled `.so`. Preview it, then confirm the deploy wallet holds comfortably more than that number plus a margin for transaction fees. (There's no `solana airdrop` on mainnet, so this has to be funded ahead of time; on devnet, `solana airdrop 2 --url devnet` covers it.)
- [ ] Produced a verifiable build with `anchor build --verifiable`. I didn't add this step to my own rehearsal, but it's the one piece of the official Anchor workflow I'd bolt on before a real mainnet run: it lets anyone later confirm the on-chain bytecode actually matches the published source. The gotcha to remember once you have one: don't overwrite it with a plain `anchor build` or `cargo build-sbf` afterward, since either can produce a different hash and quietly break verification.

## Phase 2: The deploy itself

This is the irreversible phase, so the checklist matters most here.

- [ ] Switched the CLI to the target cluster and confirmed it before running anything:
  ```bash
  solana config set --url mainnet-beta
  solana config get
  ```
  Read the output back. It's the cheapest possible check against deploying to the wrong cluster by habit.
- [ ] Confirmed `Anchor.toml`'s provider block points at the funded keypair that should hold the deploy:
  ```toml
  [provider]
  cluster = "Mainnet"
  wallet = "~/.config/solana/id.json"
  ```
  Whatever keypair signs this deploy becomes the program's upgrade authority by default, so this line gets chosen deliberately, not left over from a previous project.
- [ ] Deployed with a priority fee and a reliable RPC, since a deploy is many transactions in a row and a busy mainnet can let a blockhash expire mid-sequence:
  ```bash
  solana program deploy target/deploy/vault.so \
    --program-id target/deploy/vault-keypair.json \
    --with-compute-unit-price <PRICE_IN_MICRO_LAMPORTS> \
    --use-rpc
  ```
- [ ] Recovery note for future me: a deploy is not atomic. If it gets interrupted, there can be a buffer account left over holding SOL, one that can be resumed from or closed to reclaim the rent rather than treated as lost. The deployment docs describe this recovery flow in detail; read it before a real deploy, not after one goes sideways.

## Phase 3: Authority and verification, right after deploy

- [ ] Confirmed the program is live and read back its upgrade authority:
  ```bash
  solana program show <PROGRAM_ID>
  ```
  This is the single most important fact in the whole checklist: is the authority field exactly what was intended, and nothing left over from testing.
- [ ] Decided, on purpose, who holds that authority. I rehearsed all three options against devnet rather than committing blind on a live program:
  - A single keypair I control, moved with one command:
    ```bash
    solana program set-upgrade-authority <PROGRAM_ID> \
      --new-upgrade-authority new-authority.json
    ```
  - A Squads multisig, where upgrades need multiple approvals, handed off with `--skip-new-upgrade-authority-signer` since a multisig can't sign the transfer transaction itself the way a keypair can.
  - `--final`, which removes the authority entirely and makes the program permanently immutable, on any cluster, with no undo:
    ```bash
    # Irreversible. Only ever run this on a program meant to be frozen for good.
    solana program set-upgrade-authority <PROGRAM_ID> --final
    ```
  Each is a legitimate choice with a different tradeoff between "I can still fix a bug" and "no one, including me, can ever change this again." For an actual mainnet launch this gets decided and written down before the deploy, not improvised after.
- [ ] Published the IDL on-chain and confirmed it round-trips:
  ```bash
  anchor idl init -f target/idl/vault.json <PROGRAM_ID> \
    --provider.cluster <CLUSTER_URL>
  anchor idl fetch <PROGRAM_ID> --provider.cluster <CLUSTER_URL> -o fetched-idl.json
  ```
  Skipping the IDL publish is a quiet failure: build verification later has nothing to check against, and anyone deriving a client from the program gets nothing back.
- [ ] Regenerated the Codama client so the frontend's types match exactly what's on-chain:
  ```bash
  npx codama run js
  ```
  Codama reads `codama.json`, points at the IDL, and writes the client into `clients/js/src/generated/`, including instruction builders whose argument names come straight from the Rust program. If an instruction gets renamed and the program rebuilt, this is the file that changes to match, not the other way around.
  - Reminder for the next time the program changes after this: `anchor idl upgrade -f target/idl/vault.json <PROGRAM_ID> --provider.cluster <CLUSTER_URL>`, signed by the same authority that published it.

## Phase 4: Frontend and going live

- [ ] Pointed the React frontend's RPC endpoint at the real program ID and cluster (the one place this lives is `src/providers.tsx`).
- [ ] Confirmed the Wallet Standard connection surfaces real wallets against the target cluster, wallet and app cluster matching. (A mismatch here, wallet on mainnet while the app reads devnet or vice versa, is the single most common reason a balance reads zero and the whole thing looks broken when it isn't.)
- [ ] Ran back through every failure mode the error classifier handles, now that the stakes are real, and confirmed each one still produces a calm, legible message instead of a raw stack trace:
  - User rejects the wallet popup: a quiet, informational message, nothing red.
  - Insufficient funds: a clear, non-retryable explanation.
  - Blockhash expired: a message that explains what happened and offers a retry.
  - Anything unclassified: at minimum, a message that doesn't look broken, and a note to add a real branch for it before this happens twice.
- [ ] Announced the launch somewhere people would see it.
- [ ] Wrote down, in a place a user could actually find it, where to report a problem.

## Run it

The one command that confirms the most important fact in the whole checklist, run against my devnet rehearsal (this is the exact output; on a real mainnet launch the only thing that changes is `--url mainnet-beta`):

```bash
solana program show GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf --url devnet
```

**[Screenshot: `solana program show` output for the vault program]**

```
Program Id: GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: 61UVAVy9u33vBKNhS4MZJsgEQKA2zWzZsdgvxSmgcFLg
Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
Last Deployed In Slot: 479630308
Data Length: 151536 (0x24ff0) bytes
Balance: 1.05589464 SOL
```

Program ID, owner, and authority all read back exactly as expected. That's the whole point of the check: not "I think I deployed correctly," but "I know I did," in one command's output.

## What surprised me most

The gap in my own error classifier. I'd handled the failures I expected: a rejected popup, an overspent balance, an expired blockhash. Then I disconnected the wallet mid-flow just to see what would happen, and it fell straight into the generic "unknown" bucket instead of anything useful. Nothing about that scenario was exotic; it just wasn't one I'd thought to write a check for until I went looking for it on purpose. That's the same lesson as the checklist itself: the failures that get you aren't the exotic ones, they're the ordinary ones nobody wrote down.

## Resources

- [Deploying Programs](https://solana.com/docs/programs/deploying), the official guide to deployment, buffer accounts, and recovery
- [Anchor Verifiable Builds](https://www.anchor-lang.com/docs), how to produce a build whose on-chain bytecode matches your source
- Squads on managing program upgrades with a multisig
- Solana production-readiness guidance on RPC reliability

*Written as part of #100DaysOfSolana.*
