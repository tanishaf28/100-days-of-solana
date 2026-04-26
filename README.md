<div align="center">

# 100 Days of Solana

### *Building on Solana, one day at a time.*

[![Challenge](https://img.shields.io/badge/MLH-100%20Days%20of%20Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://www.mlh.com/events/100-days-of-solana/challenges)
[![Network](https://img.shields.io/badge/Network-Devnet-00FFA3?style=for-the-badge)](https://api.devnet.solana.com)
[![Started](https://img.shields.io/badge/Started-Apr%2020%202026-14F195?style=for-the-badge)](https://github.com)
[![Progress](https://img.shields.io/badge/Progress-Day%207%20%2F%20100-9945FF?style=for-the-badge)](https://github.com)

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

---

##  Repo Structure

```
solana/
├── 📁 day-4-wallet/          # Vite browser wallet app (Day 4)
│   └── src/main.js
├── 📜 create-wallet.mjs      # Keypair generation (Day 1)
├── 📜 persistent-wallet.mjs  # Persistent wallet + balance (Day 2)
├── 📦 package.json
└── 📝 week1.txt              # Notes
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

## 🌐 Community

[![Discord](https://img.shields.io/badge/Discord-MLH%20100%20Days%20Channel-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.com/channels/688852585071116289/1493602438513561600)
[![DEV](https://img.shields.io/badge/DEV-100daysofsolana-0A0A0A?style=flat-square&logo=devdotto&logoColor=white)](https://dev.to/t/100daysofsolana)
[![Twitter](https://img.shields.io/badge/Twitter-%23100DaysOfSolana-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/hashtag/100DaysOfSolana)

---

</div>
