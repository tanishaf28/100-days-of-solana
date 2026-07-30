# Day 5: Explore Different Wallet Types

## The Scenario

I've generated keypairs on the command line, saved secret keys to files, and connected a browser wallet to devnet. All of these are "wallets," but they work differently, protect keys differently, and suit different use cases. A CLI keypair file sitting on a laptop is not the same thing as a hardware device that never exposes its private key to software.

Today's goal: set up and compare three different wallet types hands-on, to understand the tradeoffs each one makes between convenience, security, and programmability, and why most Solana developers use more than one.

## Quick mental model

In Web2, there are different ways to authenticate depending on what you're doing. You might SSH into a server with a local key, log into a dashboard with a password and 2FA, or use a hardware security key for production infrastructure. Each method makes a different tradeoff between ease of use and security. Solana wallets work the same way: they're all managing the same underlying keypair, but where and how they store it changes everything.

Two axes matter most:

- **Hot vs. cold:** is the private key on a device connected to the internet (hot) or on something air-gapped or offline (cold)?
- **Custodial vs. non-custodial:** do I control the private key, or does someone else hold it for me?

Every wallet sits somewhere on these two axes.

## The experiment

Three wallet types today: the CLI wallet I already know, a browser extension wallet, and a mobile wallet. For each one, the same three steps: create or connect a wallet, get its public key, and request a devnet airdrop. Then compare what the experience felt like.

### 1. CLI wallet (already done)

Already generated a keypair with `solana-keygen` in an earlier challenge. Pulled it up again:

```bash
solana address
solana balance
```

The private key lives in a JSON file at `~/.config/solana/id.json`. That's it, a file on disk. Anyone who can read that file can sign transactions as me. There's no password prompt, no confirmation dialog, no 2FA. This is a hot wallet in the most literal sense: the key is a plaintext file on an internet-connected machine. That's fine for devnet work and local development, and it's exactly how most Solana developers interact with their programs during testing, but not how you'd store real value.

### 2. Browser extension wallet

If a browser wallet was already set up for Day 4's challenge, that same wallet works here. Otherwise, install Phantom or Backpack in the browser. Either way, pay attention to what happens during setup:

- Set a password. This encrypts the private key at rest in the browser's storage.
- Get a seed phrase (usually 12 or 24 words): a human-readable recovery phrase for the wallet. From it, the wallet can derive the private keys for its accounts. Write it down physically; if the device is lost, this is usually how access gets recovered.
- The extension generates the keypair and shows the public address.

Then switch the wallet to devnet in its settings, and request an airdrop through the wallet's UI or the faucet at faucet.solana.com. In Phantom, this is usually under Settings and Developer Settings.

Compared to the CLI: same keypair concept underneath, but the browser wallet adds a password layer, gives a recovery seed phrase, and shows a confirmation popup every time a site wants to sign a transaction. That popup is doing real work; it's the reason browser wallets are safer for everyday use than a plaintext JSON file. You see what you're approving before you approve it.

### 3. Mobile wallet

Installed a mobile wallet (Phantom works on iOS and Android, or Solflare). Created a new wallet on the phone rather than importing the browser wallet's seed phrase, to see the full setup flow again.

Differences from the browser experience:

- Mobile wallets often support biometric auth (Face ID, fingerprint) instead of or alongside a password.
- The seed phrase backup flow is the same; that's common across non-custodial wallets.
- Depending on the wallet and device, some mobile wallets can use OS- or hardware-backed secure storage for key material.

Switched to devnet and airdropped again, then sent a small amount of devnet SOL (0.01 SOL) from the mobile wallet to the CLI wallet address, and verified it arrived with `solana balance`. That's the first cross-wallet transfer: same network, different keypairs, different security models. Three wallets running now, three different keypairs, each with a devnet SOL balance.

## Further reading: hardware and multisig wallets

Two other wallet types worth knowing about, even though they're harder to try on devnet:

A **hardware wallet** like a Ledger stores the private key on a separate physical device. The key never leaves the device: when a transaction needs signing, the transaction data is sent to the device, signed there, and the signed result is sent back. The computer never sees the private key. This is a cold wallet, high security, lower convenience, and it's what most people use for storing real value.

A **multisig wallet** (like Squads on Solana) requires multiple people to approve a transaction before it executes, like requiring two signatures on a company check. DAOs and teams use these to manage shared treasuries so no single person can move funds alone.

## Compare your results

Three wallets running now. Questions worth sitting with:

- Which wallet was fastest to set up?
- Which felt safest?
- Where is the private key stored in each case? Could I point to the exact file or storage location?
- If my laptop caught fire right now, which wallets could I recover, and how?
- If I were building a dApp and needed to sign 500 test transactions in a script, which wallet would I use?
- If I were holding $10,000 in SOL, which wallet would I use?

The answers are different for each question, and that's the point. The "best" wallet depends entirely on what you're doing with it.

## What I found

Working with the CLI wallet, Phantom on my laptop, and Solflare on my phone made me realize that all wallets are doing the same thing (managing a keypair), but the experience is completely different.

The CLI wallet was the fastest to use: just run a command and you're done. But it also felt the most unsafe, since the private key is literally just a JSON file on my laptop. No password, no confirmation, nothing. It's great for dev work, but I wouldn't trust it with real funds.

Phantom on my laptop was easily my favorite. The setup felt clean, and having a password plus a seed phrase made it feel way more secure than the CLI. The transaction popups are actually really helpful, since you can see what you're signing before approving it. It feels like the right balance between convenience and security.

Solflare on my phone felt very secure too, especially with biometric login, but I still preferred Phantom overall because it's quicker to use while working on my laptop. Recovery-wise, Phantom and Solflare are both solid because of the seed phrase: if the device is gone, everything is still recoverable. The CLI wallet is just "hope you didn't lose the file."

If I had to choose a role for each:

- **CLI:** dev and scripting
- **Phantom:** my go-to for everything
- **Solflare:** backup and mobile use

There's no single "best" wallet, it depends on what you need. But for me, Phantom hits the sweet spot between being easy to use and still feeling secure.
