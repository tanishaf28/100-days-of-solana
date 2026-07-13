# 100 Days of Solana : Week 1 Summary

## Theme: Identity and Your First Wallet

Week 1 covered the foundational concept of Solana development: what identity means on a decentralized network, and how to work with wallets at every level from raw keypairs to browser extensions.

---

## Day 1 : Generate a Keypair and Get Devnet SOL

The first challenge introduced the core primitive of Solana identity: the **keypair**. Unlike Web2 where identity lives on someone else's server, a Solana keypair is generated entirely on your machine using the Ed25519 algorithm. The public key is your address (safe to share); the private key proves ownership (never share it).

Using `@solana/kit`, a new keypair can be generated in a few lines:

```js
import { generateKeyPairSigner } from "@solana/kit";
const wallet = await generateKeyPairSigner();
console.log(wallet.address);
```

Devnet SOL: free test tokens with no real value  was obtained via [faucet.solana.com](https://faucet.solana.com) to fund the new address for future transactions.

**Key insight:** You can create a valid Solana wallet fully offline. No account creation, no email, no server.

---

## Day 2 : Persistent Wallet

Day 1's keypair lived only in memory and was lost on exit. Day 2 fixed that by saving the keypair to a local JSON file and reloading it on subsequent runs.

The script used `generateKeyPair(true)` (the `true` makes keys extractable), exported the private key in PKCS8 format, sliced off the 16-byte header to get the raw 32 bytes, then stored the full 64-byte Solana keypair format (32 bytes private + 32 bytes public) to `wallet.json`.

**Key insight:** This is the same format the Solana CLI uses for its keypair files. Storing private keys in plain JSON is fine for devnet experiments  never do it with real funds.

---

## Day 3 :SOL and Lamports

Solana's runtime never works with SOL directly it works in **lamports**, the smallest indivisible unit.

```
1 SOL = 1,000,000,000 lamports
```

The name honors Leslie Lamport, whose work on distributed systems laid theoretical groundwork for blockchains. The reason for integer-only arithmetic is simple: floating point is unreliable for money (`0.1 + 0.2 = 0.30000000000000004`). Every RPC call, fee, and transfer is denominated in lamports.

Common values worth recognizing:

| Lamports | SOL | What it is |
|---|---|---|
| 5,000 | 0.000005 | Typical base transaction fee |
| 890,880 | ~0.00089 | Minimum rent for a token account |
| 1,000,000,000 | 1 | Exactly 1 SOL |

This day also introduced the **Solana CLI** (`solana-keygen`, `solana balance --lamports`, `solana airdrop`, `solana confirm`).

**Key insight:** If you ever pass `1` where you meant `1000000000`, you just moved one-billionth of a SOL instead of one SOL. Always think in lamports when writing code.

---

## Day 4 Connect a Browser Wallet

Real users don't paste 64-byte secret keys into web apps. This day introduced browser wallet extensions (Phantom, Solflare, Backpack) and the **Wallet Standard**  an open protocol that lets any wallet work with any app without custom integration code.

A Vite app was built that:
1. Discovers installed wallets via `getWallets()` from `@wallet-standard/app`
2. Filters for Solana-compatible wallets (`wallet.chains` starting with `"solana:"`)
3. Requests a connection (the wallet prompts the user to approve)
4. Displays the connected address and devnet balance

The app never touches the private key. It only ever sees the public address and the ability to request signatures.

**Key insight:** This is the Web3 equivalent of "Sign in with Google"  you delegate key management to a trusted provider and get back a verified identity.

---

## Day 5  Explore Different Wallet Types

Three wallet types were compared hands-on, all managing the same underlying keypair concept but with very different security tradeoffs:

| Wallet Type | Where the Key Lives | Security Level | Best For |
|---|---|---|---|
| CLI (JSON file) | Plaintext file on disk | Low | Scripts, local dev, testing |
| Browser extension | Encrypted in browser storage, password + seed phrase | Medium | Daily use, dApp interaction |
| Mobile wallet | Device storage, often biometric auth | Medium-High | Everyday transactions |
| Hardware wallet | Never leaves the physical device | High | Storing real value |
| Multisig | Distributed across multiple signers | Very High | Team treasuries, DAOs |

A cross-wallet transfer was completed: devnet SOL sent from a mobile wallet to a CLI wallet address, verified with `solana balance`.

**Key insight:** The "best" wallet depends entirely on what you're doing. Use CLI for scripts, browser/mobile for dApps, hardware for real money.

---

## Day 6 : On-Chain Identity (Blog Post)

A blog post was written for DEV Community explaining on-chain identity to a Web2 developer audience. The core argument:

- In Web2, identity is fragmented across services and controlled by third parties who can revoke access.
- On Solana, identity is a single cryptographic keypair. Only the holder of the private key can sign transactions  no company, no admin panel, no password reset.
- A Solana address is a 32-byte Ed25519 public key encoded in Base58 (characters like `0`, `O`, `I`, `l` are excluded to prevent visual confusion).
- On-chain identity enables token ownership, program interactions, governance votes, and reputation — all without anyone's permission.

---

## Day 7 : Amplify (Community Sharing)

An "Amplify" day focused on making learning visible: posting highlights from the week on social media and DEV Community with `#100DaysOfSolana`, then engaging meaningfully with other participants' posts.

---

## Week 1 at a Glance

By the end of week 1, the following were covered:

- **Keypairs** : how they're generated, what they represent, Ed25519
- **Devnet** : free test environment, faucet, no real monetary value
- **Lamports** : why all on-chain values are integers, conversion math
- **Wallet types**  CLI, browser, mobile, hardware, multisig and their tradeoffs
- **Wallet Standard** : how browser apps connect to wallets without custom integrations
- **On-chain identity** : what it means to own an account with no middleman

The next arc builds on this foundation: writing transactions, transferring tokens, and interacting with programs on-chain.
