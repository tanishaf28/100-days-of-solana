<div align="center">

# 100 Days of Solana

### *Building on Solana, one day at a time.*

[![Challenge](https://img.shields.io/badge/MLH-100%20Days%20of%20Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://www.mlh.com/events/100-days-of-solana/challenges)
[![Network](https://img.shields.io/badge/Network-Devnet-00FFA3?style=for-the-badge)](https://api.devnet.solana.com)
[![Started](https://img.shields.io/badge/Started-Apr%2020%202026-14F195?style=for-the-badge)](https://github.com)
[![Progress](https://img.shields.io/badge/Progress-Day%2045%20%2F%20100-9945FF?style=for-the-badge)](https://github.com)

</div>

---

##  What is this?

This repo tracks my journey through the **[MLH 100 Days of Solana](https://www.mlh.com/events/100-days-of-solana/challenges)** challenge, a structured, hands-on program that takes developers from zero to shipping on Solana.

> *"Each day is a small, concrete step. Together, they add up to real understanding."*

**Apr 20 → Jul 26, 2026** &nbsp;·&nbsp; 100 days &nbsp;·&nbsp; 4 epochs &nbsp;·&nbsp; 1 goal: ship something real

---

##  The Roadmap

The challenge is split into four **Epochs**, each building on the last:

```
╔══════════════════════════════════════════════════════════════╗
║  EPOCH 1 · Reading and Writing Data                          ║
╠══════════════════════════════════════════════════════════════╣
║  EPOCH 2 · Owning and Moving Data                            ║
║           (Tokens and Value)                                 ║
╠══════════════════════════════════════════════════════════════╣
║  EPOCH 3 · Building Programs and Contracts                   ║
╠══════════════════════════════════════════════════════════════╣
║  EPOCH 4 · Shipping and Exploring                            ║
╚══════════════════════════════════════════════════════════════╝
```

Each week follows the same rhythm:

| Day | Type | Purpose |
|-----|------|---------|
| Mon | ▶️ Try | Understand the idea |
| Tue | 🛠️ Build | Get it working |
| Wed | 📈 Stretch | Go further |
| Thu | 📌 Reinforce | Make it stick |
| Fri | 🧪 Experiment | Try your own approach |
| Sat | 📝 Document | Write on [DEV](https://dev.to/) |
| Sun | 🚀 Amplify | Learn from others |

---

## 📅 Progress Log

### Epoch 1  Reading and Writing Data

<details open>
<summary><strong>Week 1 · Identity and Your First Wallet</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 1 | ▶️ Try | Generate a keypair + get devnet SOL |
| 2 | 🛠️ Build | Persistent wallet with balance check |
| 3 | 📈 Stretch | SOL & Lamports deep dive (CLI) |
| 4 | 📌 Reinforce | Browser wallet connect (Vite app) |
| 5 | 🧪 Experiment | Compare 3 wallet types hands-on |
| 6 | 📝 Document | Blog post: On-chain identity for Web2 devs |
| 7 | 🚀 Amplify | Community sharing + engagement |

</details>

<details>
<summary><strong>Week 2 · Reading and Comparing On-Chain Data</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 8 | ▶️ Try | Read an account balance |
| 9 | 🛠️ Build | Fetch transaction history |
| 10 | 📈 Stretch | Balance/transaction dashboard |
| 11 | 📌 Reinforce | Solana accounts vs. a traditional database (write-up) |
| 12 | 🧪 Experiment | Compare data across devnet and mainnet |
| 13 | 📝 Document | — *(missing)* |
| 14 | 🚀 Amplify | — *(missing)* |

</details>

<details>
<summary><strong>Week 3 · Sending Your First Transaction</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 15 | ▶️ Try | — *(missing)* |
| 16 | 🛠️ Build | Generate a recipient keypair, transfer devnet SOL |
| 17 | 📈 Stretch | Build a reusable SOL transfer tool |
| 18 | 📌 Reinforce | — *(missing)* |
| 19 | 🧪 Experiment | — *(missing)* |
| 20 | 📝 Document | — *(missing)* |
| 21 | 🚀 Amplify | — *(missing)* |

</details>

<details>
<summary><strong>Week 4 · Reading Program-Owned Data</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 22 | ▶️ Try | — *(missing)* |
| 23 | 🛠️ Build | Solana Account Explorer CLI (balance, owner, executable flag, raw data hex dump) |
| 24 | 📈 Stretch | Decode raw mint account bytes three ways: `@solana-program/token` decoder, manual `DataView` byte parsing, and RPC `jsonParsed` |
| 25 | 📌 Reinforce | — *(missing)* |
| 26 | 🧪 Experiment | — *(missing)* |
| 27 | 📝 Document | — *(missing)* |
| 28 | 🚀 Amplify | — *(missing)* |

</details>

---

### Epoch 2  Owning and Moving Data (Tokens and Value)

<details open>
<summary><strong>Week 5 · Token Extensions (Token-2022)</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 29 | ▶️ Try | Token-2022 recap combining the metadata + transfer fee extensions |
| 30 | 🛠️ Build | Designed a sustainable token incentive system using the metadata extension |
| 31 | 📈 Stretch | Transfer fee extension (fee-on-transfer tokens) |
| 32 | 📌 Reinforce | Combined transfer fees and metadata on a single mint |
| 33 | 🧪 Experiment | Non-transferable (soulbound) tokens |
| 34 | 📝 Document | — *(missing)* |
| 35 | 🚀 Amplify | — *(missing)* |

</details>

<details open>
<summary><strong>Week 6 · More Token Extensions</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 36 | ▶️ Try | Interest-bearing tokens |
| 37 | 🛠️ Build | Combined transfer fees, interest, and metadata on one mint |
| 38 | 📈 Stretch | Freeze/thaw accounts — default account state extension |
| 39 | 📌 Reinforce | Review: extension account sizes and rent costs |
| 40 | 🧪 Experiment | — *(missing)* |
| 41 | 📝 Document | — *(missing)* |
| 42 | 🚀 Amplify | — *(missing)* |

</details>

<details open>
<summary><strong>Week 7 · Minting NFTs with Token-2022</strong></summary>

<br/>

| # | Day | What I Built |
|---|-----|-------------|
| 43 | ▶️ Try | Minted a true 1-of-1 non-fungible token: 0-decimal mint, minted supply of 1, mint authority disabled |
| 44 | 🛠️ Build | Added on-chain metadata to an NFT (name/symbol/URI via the Token-2022 metadata extension, JSON hosted on a GitHub Gist) |
| 45 | 📈 Stretch | Built an NFT collection: one mint with the group extension plus two member mints linked to it via the group member extension |

</details>

---

##  Repo Structure

```
solana/
├── 📁 week1/   # Days 1-7   · Identity & first wallet (CLI keypair, persistent wallet, Vite browser wallet)
├── 📁 week2/   # Days 8-14  · Reading & comparing on-chain data (balance, tx history, dashboard)
├── 📁 week3/   # Days 15-21 · First transactions (SOL transfer tool)
├── 📁 week4/   # Days 22-28 · Reading program-owned data (account explorer, byte-level decoding)
├── 📁 week5/   # Days 29-35 · Token Extensions (Token-2022): metadata, transfer fees, soulbound
├── 📁 week6/   # Days 36-42 · More Token Extensions: interest-bearing, freeze/thaw, rent review
└── 📁 week7/   # Days 43-45+· NFTs on Token-2022: single mint, metadata, collections
```

---

##  Stack

```
Runtime     Node.js
Library     @solana/kit
Frontend    Vite (vanilla JS) + @wallet-standard/app
Network     Solana Devnet
Wallets     Phantom / Solflare / Backpack
```

---

##  Key Concepts : Week 1 TL;DR

- **Keypair = identity.** A public key (your address) + private key (your proof). No email, no server, no middleman.
- **Lamports, always.** `1 SOL = 1,000,000,000 lamports`. Every RPC call, fee, and transfer uses integers — never floats.
- **Wallet Standard.** Browser apps don't talk to Phantom specifically they talk to any wallet implementing the open standard.
- **You can create a valid wallet offline.** Ed25519 math, no internet required.

---

##  Key Concepts : Token Extensions (Token-2022) TL;DR

- **Token-2022 is a superset, not a replacement.** Same mint/account model as the original Token Program, plus opt-in extensions declared at mint creation time.
- **NFT = supply of 1, 0 decimals, no mint authority.** Metadata (name/symbol/URI) is what makes it *legible*; disabling the mint authority is what makes it *scarce*.
- **Extensions compose.** A single mint can carry metadata + transfer fees + interest-bearing + group/group-member simultaneously — each just reserves more space on the mint account (and more rent).
- **Collections are just two linked mints.** A "collection" mint holds the group extension (with a max size); each "member" mint points back at it via the group member extension.

---

## 🌐 Community

[![Discord](https://img.shields.io/badge/Discord-MLH%20100%20Days%20Channel-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.com/channels/688852585071116289/1493602438513561600)
[![DEV](https://img.shields.io/badge/DEV-100daysofsolana-0A0A0A?style=flat-square&logo=devdotto&logoColor=white)](https://dev.to/t/100daysofsolana)
[![Twitter](https://img.shields.io/badge/Twitter-%23100DaysOfSolana-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/hashtag/100DaysOfSolana)

---

</div>
