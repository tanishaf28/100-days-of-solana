<div align="center">

# 100 Days of Solana

### *Building on Solana, one day at a time.*

[![Challenge](https://img.shields.io/badge/MLH-100%20Days%20of%20Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://www.mlh.com/events/100-days-of-solana/challenges)
[![Network](https://img.shields.io/badge/Network-Devnet-00FFA3?style=for-the-badge)](https://api.devnet.solana.com)
[![Started](https://img.shields.io/badge/Started-Apr%2020%202026-14F195?style=for-the-badge)](https://github.com)
[![Progress](https://img.shields.io/badge/🎉%20100%20Days-Complete-9945FF?style=for-the-badge)](https://github.com)

</div>

---

##  What is this?

You've explored web3 but aren't sure what to build or where to start. **100 Days of Solana** is an [MLH](https://www.mlh.com/events/100-days-of-solana/challenges) hands-on challenge series that takes you from curiosity to capability: daily, practical tasks that teach what you can build with Solana, why you'd choose it, and how to apply the skills you already have as a developer. This repo tracks my run through it, end to end.

> *"Each day is a small, concrete step. Together, they add up to real understanding."*

**Day 1: Apr 20, 2026 → Day 100: Jul 26, 2026**  ·  100 days  ·  4 epochs  ·  1 goal: ship something real

**Status:** complete. Every one of the 100 days has a write-up in this repo, ending with the Day 99 capstone ("Proof of Ship," deployed to devnet) and the Day 100 whole-program retrospective.

---

## What's an "Arc"?

The challenge groups every 7 days into an **Arc**, and each Arc gets its own `weekN/` folder in this repo (Arc 1 = `week1/`, Arc 14 = `week14/`, and so on). Inside an Arc, every day has a fixed role, so the same Mon-Sun rhythm repeats all 100 days: early in the Arc you learn and build the thing, mid-Arc you make it stick and push it further, and the back half is where it becomes public, first as a write-up, then as a shared post. A handful of Arcs are grouped again into a larger **Epoch**, which is the actual chapter of the curriculum (see the roadmap below); an Arc is the week-sized unit of work, an Epoch is the multi-week theme that work belongs to.

---

##  The Roadmap

The challenge is split into four **Epochs**, each building on the last:

```
╔══════════════════════════════════════════════════════════════╗
║  EPOCH 1 · Reading and Writing Data          (Arcs 1-4)      ║
╠══════════════════════════════════════════════════════════════╣
║  EPOCH 2 · Owning and Moving Data            (Arcs 5-8)      ║
║           (Tokens and Value)                                  ║
╠══════════════════════════════════════════════════════════════╣
║  EPOCH 3 · Building Programs and Contracts   (Arcs 9-12)      ║
╠══════════════════════════════════════════════════════════════╣
║  EPOCH 4 · Shipping and Exploring            (Arcs 13-15)     ║
╚══════════════════════════════════════════════════════════════╝
```

Each Arc follows the same rhythm:

| Day | Type | Purpose |
|-----|------|---------|
| Mon | ▶️ Try | Understand the idea |
| Tue | 🛠️ Build | Get it working |
| Wed | 📈 Stretch | Go further |
| Thu | 📌 Reinforce | Make it stick |
| Fri | 🧪 Experiment | Try your own approach |
| Sat | 📝 Document | Share your work on [DEV](https://dev.to/) |
| Sun | 🚀 Amplify | Learn from others and get feedback |

---

## 📅 Progress Log

### Epoch 1 · Reading and Writing Data

<details>
<summary><strong>Arc 1 (week1) · Identity and Your First Wallet</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 1 | ▶️ Try | Generate a keypair + get devnet SOL |
| 2 | 🛠️ Build | Persistent wallet with balance check |
| 3 | 📈 Stretch | SOL & Lamports deep dive (CLI) |
| 4 | 📌 Reinforce | Browser wallet connect (Vite app) |
| 5 | 🧪 Experiment | Compared 3 wallet types (CLI, Phantom, Solflare) hands-on |
| 6 | 📝 Document | Blog post: on-chain identity for Web2 devs |
| 7 | 🚀 Amplify | Community sharing + engagement |

</details>

<details>
<summary><strong>Arc 2 (week2) · Reading and Comparing On-Chain Data</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 8 | ▶️ Try | Read an account balance |
| 9 | 🛠️ Build | Fetch transaction history |
| 10 | 📈 Stretch | Balance/transaction dashboard |
| 11 | 📌 Reinforce | Solana accounts vs. a traditional database (write-up) |
| 12 | 🧪 Experiment | Compare data across devnet and mainnet |
| 13 | 📝 Document | "I Queried a Blockchain Like a Database and It Kind of Broke My Brain" |
| 14 | 🚀 Amplify | Shared a highlight on querying any address with no API key/auth |

</details>

<details>
<summary><strong>Arc 3 (week3) · Sending Your First Transaction</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 15 | ▶️ Try | Sent a devnet transfer, mapped its structure to an HTTP request analogy |
| 16 | 🛠️ Build | Generate a recipient keypair, transfer devnet SOL |
| 17 | 📈 Stretch | Build a reusable SOL transfer tool |
| 18 | 📌 Reinforce | Staged commitment polling: processed → confirmed → finalized |
| 19 | 🧪 Experiment | Transaction anatomy recap + confirmed fees still charge on a failed send |
| 20 | 📝 Document | "I Built a CLI That Signs and Sends Real SOL, and Then I Made It Fail on Purpose" |
| 21 | 🚀 Amplify | Shared the two CLIs + the failed-transactions-still-cost-fees lesson |

</details>

<details>
<summary><strong>Arc 4 (week4) · Reading Program-Owned Data</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 22 | ▶️ Try | Compared a wallet, an SPL Token account, and a System Program account |
| 23 | 🛠️ Build | Solana Account Explorer CLI (balance, owner, executable flag, raw data hex dump) |
| 24 | 📈 Stretch | Decode raw mint account bytes three ways: decoder, manual `DataView`, RPC `jsonParsed` |
| 25 | 📌 Reinforce | Inspected native programs and sysvar accounts (Clock, Rent) |
| 26 | 🧪 Experiment | Open-ended Explorer scavenger hunt across devnet/mainnet |
| 27 | 📝 Document | "Solana's Account Model, Explained for Web2 Developers" |
| 28 | 🚀 Amplify | Recapped the wallet-vs-System-Program comparison |

</details>

---

### Epoch 2 · Owning and Moving Data (Tokens and Value)

<details>
<summary><strong>Arc 5 (week5) · Token Extensions (Token-2022)</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 29 | ▶️ Try | Token-2022 recap combining the metadata + transfer fee extensions |
| 30 | 🛠️ Build | Designed a sustainable token incentive system using the metadata extension |
| 31 | 📈 Stretch | Transfer fee extension (fee-on-transfer tokens) |
| 32 | 📌 Reinforce | Combined transfer fees and metadata on a single mint |
| 33 | 🧪 Experiment | Non-transferable (soulbound) tokens |
| 34 | 📝 Document | "What I Learned About Token Design on Solana as a Web2 Developer" |
| 35 | 🚀 Amplify | Shared the week's token extensions work on X |

</details>

<details>
<summary><strong>Arc 6 (week6) · More Token Extensions</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 36 | ▶️ Try | Interest-bearing tokens |
| 37 | 🛠️ Build | Combined transfer fees, interest, and metadata on one mint |
| 38 | 📈 Stretch | Freeze/thaw accounts, default account state extension |
| 39 | 📌 Reinforce | Review: extension account sizes and rent costs |
| 40 | 🧪 Experiment | Non-transferable "Solana Dev Credential" token with a permanent delegate |
| 41 | 📝 Document | "Reading a Token Mint: How I Learned to Inspect On Chain Configuration" |
| 42 | 🚀 Amplify | Shared the token extensions week on X |

</details>

<details>
<summary><strong>Arc 7 (week7) · Minting NFTs with Token-2022</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 43 | ▶️ Try | Minted a true 1-of-1 NFT: 0-decimal mint, supply of 1, mint authority disabled |
| 44 | 🛠️ Build | Added on-chain metadata to an NFT via the Token-2022 metadata extension |
| 45 | 📈 Stretch | Built an NFT collection: a group-extension mint plus two linked member mints |
| 46 | 📌 Reinforce | Verified a member NFT's Group address matches its collection mint byte for byte |
| 47 | 🧪 Experiment | Live-updated an NFT's on-chain metadata: renamed it, added/removed a field, repointed the URI |
| 48 | 📝 Document | "What I Learned Minting NFTs on Solana With Token Extensions" |
| 49 | 🚀 Amplify | X thread on how NFT metadata lives inside the mint account and how collections work |

</details>

<details>
<summary><strong>Arc 8 (week8) · Stacking Token-2022 Extensions</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 50 | ▶️ Try | Transfer Fee extension mint (100 bps) |
| 51 | 🛠️ Build | Transferred fee-bearing tokens, withdrew the withheld fee |
| 52 | 📈 Stretch | Stacked Transfer Fee and Interest Bearing extensions on one mint |
| 53 | 📌 Reinforce | Compared two mints side by side with `spl-token display` |
| 54 | 🧪 Experiment | Non-transferable mint, confirmed the runtime rejects a transfer |
| 55 | 📝 Document | "Three Token 2022 Mints in One Week: Fees, Yield, and a Token That Refuses to Move" |
| 56 | 🚀 Amplify | X thread summarizing the three mints |

</details>

---

### Epoch 3 · Building Programs and Contracts

<details>
<summary><strong>Arc 9 (week9) · A First Anchor Program</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 57 | ▶️ Try | `anchor init`, scaffolded the counter project |
| 58 | 🛠️ Build | `Counter` account + `initialize` instruction, first LiteSVM test |
| 59 | 📈 Stretch | `increment` instruction with `has_one = authority` and `checked_add` |
| 60 | 📌 Reinforce | Shared test helpers, plus two negative tests |
| 61 | 🧪 Experiment | Broke the program three ways on purpose, watched the tests catch every one |
| 62 | 📝 Document | "The Regression That Never Shipped: How My Own Test Caught a One-Line Anchor Bug Before Anyone Else Could" |
| 63 | 🚀 Amplify | X post on the test that caught its own deliberate regression |

</details>

<details>
<summary><strong>Arc 10 (week10) · Program Derived Addresses</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 64 | ▶️ Try | Derived PDAs with `findProgramAddressSync`, explored bump behavior |
| 65 | 🛠️ Build | Per-user counter Anchor program using PDA seeds |
| 66 | 📈 Stretch | Added a Config singleton PDA and a pause switch |
| 67 | 📌 Reinforce | `close_counter` instruction and rent refund |
| 68 | 🧪 Experiment | Explored PDA collisions and seed spoofing |
| 69 | 📝 Document | "What I Learned About PDAs in a Week of Building on Solana" |
| 70 | 🚀 Amplify | Shared the PDA mental model on X |

</details>

<details>
<summary><strong>Arc 11 (week11) · Cross-Program Invocation</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 71 | ▶️ Try | First CPI: a System Program transfer via `sol-mover` |
| 72 | 🛠️ Build | CPI into Token-2022 to mint tokens |
| 73 | 📈 Stretch | A vault PDA that signs for itself on deposit/withdraw |
| 74 | 📌 Reinforce | CPI into a second Anchor program (`compose-lab`) |
| 75 | 🧪 Experiment | Three deliberate CPI failures, logs captured for each |
| 76 | 📝 Document | Wrote up the week's CPI patterns |
| 77 | 🚀 Amplify | Shared the CPI arc |

</details>

<details>
<summary><strong>Arc 12 (week12) · Security Auditing and Hardening</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 78 | ▶️ Try | Manual account-validation audit of the counter program |
| 79 | 🛠️ Build | Hardened a `Withdraw` instruction with `seeds`/`bump` and `has_one` |
| 80 | 📈 Stretch | Adversarial LiteSVM tests: wrong signer, substituted account, overdraw |
| 81 | 📌 Reinforce | Property testing with `proptest` + full-program fuzzing with Trident |
| 82 | 🧪 Experiment | Rebuilt the $326M Wormhole/Cashio owner-check bug, then fixed it with one type change |
| 83 | 📝 Document | "The Solana Security Checklist I Wish I'd Had Before I Reproduced the Wormhole Bug Myself" |
| 84 | 🚀 Amplify | X thread breaking the checklist into five bug/fix pairs |

</details>

---

### Epoch 4 · Shipping and Exploring

<details open>
<summary><strong>Arc 13 (week13) · Shipping to Mainnet</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 85 | ▶️ Try | Walked the full mainnet-beta deploy sequence for the vault program |
| 86 | 🛠️ Build | Rehearsed the upgrade-authority lifecycle (transfer, transfer back, `--final`) |
| 87 | 📈 Stretch | Published the IDL on-chain, generated a TypeScript client with Codama |
| 88 | 📌 Reinforce | React frontend wired through the Wallet Standard, balance + send hooks |
| 89 | 🧪 Experiment | Wallet-error classifier, deliberately triggered rejected/insufficient/disconnected failures |
| 90 | 📝 Document | "My Solana Launch Checklist (Rehearsed End to End on Devnet, Before It Ever Touches Real SOL)" |
| 91 | 🚀 Amplify | Launch post anchored to the real devnet Explorer link for the vault program |

</details>

<details open>
<summary><strong>Arc 14 (week14) · An Agent That Manages a Wallet</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 92 | ▶️ Try | Swapped the cloud LLM API for a local Ollama model in the agent loop |
| 93 | 🛠️ Build | `send_sol` transfer tool with a hardcoded spending cap |
| 94 | 📈 Stretch | Wrapped the tools in an MCP server so any client can discover them |
| 95 | 📌 Reinforce | Standalone policy engine: allowlist, per-transfer cap, session cap, deny by default |
| 96 | 🧪 Experiment | Fully autonomous two-wallet workflow agent, approvals and denials both captured |
| 97 | 📝 Document | "The Missing Manual for My Ollama-Powered Solana Agent" |
| 98 | 🚀 Amplify | Shared the autonomous run as a text post (real logs in place of a video) |

</details>

<details open>
<summary><strong>Arc 15 (week15) · Capstone and Reflection</strong></summary>

<br/>

Days 99-100 are the two special closing days, outside the usual Mon-Sun rhythm: a capstone build day, then a whole-program reflection day.

| # | Day | What I Built |
|---|-----|-------------|
| 99 | 🏗️ Capstone | "Proof of Ship," an Anchor program recording a `ShipRecord` PDA (`["ship", wallet_address]`) so each wallet can ship one on-chain capstone claim, deployed to devnet (`2Xcaj4c6rKoXdsjw86bcjmXqfApVLwCS5V5y45oGXbRT`) |
| 100 | 📖 Reflection | "100 Days of Solana: The Lesson That Kept Repeating, From My First Wallet to an AI Agent With a Spending Cap," a whole-program retrospective tying Day 14 through the Day 99 capstone back to one thesis |

</details>

---

##  Repo Structure

```
solana/
├── 📁 week1/    # Arc 1  · Days 1-7   · Identity & first wallet
├── 📁 week2/    # Arc 2  · Days 8-14  · Reading & comparing on-chain data
├── 📁 week3/    # Arc 3  · Days 15-21 · First transactions
├── 📁 week4/    # Arc 4  · Days 22-28 · Reading program-owned data
├── 📁 week5/    # Arc 5  · Days 29-35 · Token Extensions: metadata, fees, soulbound
├── 📁 week6/    # Arc 6  · Days 36-42 · More Token Extensions: interest, freeze/thaw
├── 📁 week7/    # Arc 7  · Days 43-49 · NFTs on Token-2022
├── 📁 week8/    # Arc 8  · Days 50-56 · Stacking Token-2022 extensions
├── 📁 week9/    # Arc 9  · Days 57-63 · First Anchor program (counter)
├── 📁 week10/   # Arc 10 · Days 64-70 · Program Derived Addresses
├── 📁 week11/   # Arc 11 · Days 71-77 · Cross-Program Invocation
├── 📁 week12/   # Arc 12 · Days 78-84 · Security auditing & hardening
├── 📁 week13/   # Arc 13 · Days 85-91 · Shipping to mainnet
├── 📁 week14/   # Arc 14 · Days 92-98 · AI agent managing a wallet (Ollama + MCP)
├── 📁 week15/   # Arc 15 · Days 99-100 · Capstone ("Proof of Ship") + whole-program reflection
└── 📁 solana-output/  # Screenshots, one or more per day
```

Every `weekN/` folder has a `weekN.md` summarizing that Arc against the Mon-Sun rhythm above, plus one markdown file per day (`dayN.md`). Anchor programs and standalone JS/TS projects built during a given Arc live in their own subfolder inside that week (`counter/`, `vault/`, `compose-lab/`, etc.).

---

##  Stack

```
Runtime     Node.js
Library     @solana/kit, @solana/web3.js
Frontend    Vite (vanilla JS + React) + @wallet-standard/app
Programs    Anchor 1.0, Rust
Testing     LiteSVM, proptest, Trident (fuzzing)
AI          Ollama (local LLM), Model Context Protocol (MCP)
Network     Solana Devnet (Epoch 4 rehearses the mainnet-beta path)
Wallets     Phantom / Solflare / Backpack
```

---

##  Key Concepts

**Week 1, identity:**
- **Keypair = identity.** A public key (your address) + private key (your proof). No email, no server, no middleman.
- **Lamports, always.** `1 SOL = 1,000,000,000 lamports`. Every RPC call, fee, and transfer uses integers, never floats.
- **Wallet Standard.** Browser apps don't talk to Phantom specifically, they talk to any wallet implementing the open standard.

**Token Extensions (Token-2022):**
- **Token-2022 is a superset, not a replacement.** Same mint/account model as the original Token Program, plus opt-in extensions declared at mint creation time.
- **NFT = supply of 1, 0 decimals, no mint authority.** Metadata is what makes it *legible*; disabling the mint authority is what makes it *scarce*.
- **Extensions compose.** A single mint can carry metadata + transfer fees + interest-bearing + group/group-member simultaneously.

**Programs, PDAs, and CPI (Epoch 3):**
- **A PDA is derived, not stored.** `seeds` + the program ID + a canonical bump produce an address with no private key; only the program that derived it can act on its behalf.
- **The accounts struct is the authorization layer.** `Signer`, `Account<T>`, and `has_one` do most of the security work before a handler ever runs; an `UncheckedAccount` is a promise the developer made to validate by hand.
- **Most real Solana exploits are one missing check.** The Wormhole and Cashio hacks both came down to trusting an account's bytes without confirming who owned it.

**Shipping and agents (Epoch 4):**
- **A launch checklist is the difference between "I think I deployed correctly" and "I know I did."** Deploy, verify the upgrade authority, publish the IDL, confirm the frontend, in that order, every time.
- **An AI agent should decide, never authorize.** The model picks the tool call; a policy layer in code, not the prompt, decides whether it's actually allowed to move funds.

---

## 🌐 Community

Questions, progress updates, and connecting with other participants all happen in **#100-days-of-solana-discussion** on the MLH Discord.

[![Discord](https://img.shields.io/badge/Discord-%23100--days--of--solana--discussion-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.com/channels/688852585071116289/1493602438513561600)
[![DEV](https://img.shields.io/badge/DEV-100daysofsolana-0A0A0A?style=flat-square&logo=devdotto&logoColor=white)](https://dev.to/t/100daysofsolana)
[![Twitter](https://img.shields.io/badge/Twitter-%23100DaysOfSolana-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/hashtag/100DaysOfSolana)

---

</div>
