# Day 30: Design Sustainable Token Incentive Systems

> Web2 bridge: Token economics is like designing your platform's incentive system: understand the why before you build the how

## Scenario

Yesterday, I created my first token on Solana's devnet. I ran a command, a new mint appeared, and I minted some supply. It worked, but if I looked at that token in an explorer, it was just a string of characters with no name, no symbol, no identity. It was like launching a new rewards program for a platform but forgetting to give it a name or a logo. Users would see a random ID in their account and have no idea what it represents.

In Web2, when you design a loyalty system, a virtual currency, or an in-app credit, you give it a brand: a name, a symbol, maybe an icon. You define how many decimal places it supports. You think about how it gets distributed. Today, I built a token from scratch using the Token Extensions Program (also known as Token-2022), gave it on-chain metadata (a name, a symbol, and a link to additional details), created a token account to hold it, minted a supply, and then transferred tokens to a second wallet. By the end, I had a fully branded, distributable token living on devnet.

## Challenge

### What I'll Need

- A terminal with the Solana CLI installed
- The spl-token CLI (installed alongside the Solana CLI tools)
- The Solana CLI configured for devnet (`solana config set --url devnet`)
- A funded devnet wallet (use `solana airdrop 2` if SOL is needed)

## Steps

1. **Create a token mint with metadata enabled.** Yesterday, I created a token using the original SPL Token Program. Today I used the Token Extensions Program instead. This newer program lets me store metadata directly on the mint account itself, so the token's name, symbol, and details live right on-chain rather than in a separate account. The `--program-id` flag tells the CLI to use the Token Extensions Program, and `--enable-metadata` activates the metadata extension on the new mint. The `--decimals 6` flag sets precision, similar to how USD uses two decimal places for cents. Six decimals is a common choice for fungible tokens on Solana.

   **Run it:**

   ```bash
   spl-token create-token \
     --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
     --enable-metadata \
     --decimals 6
   ```

   Copy the token mint address from the output. It gets used in every step that follows.

2. **Initialize metadata on the token.** Now give the token an identity. The `initialize-metadata` command writes a name, symbol, and URI directly to the mint account. The URI typically points to a JSON file with extended details (description, image, attributes), similar to how an API endpoint returns metadata about a resource. For this challenge, any public URL or a placeholder works.

   **Run it:**

   ```bash
   spl-token initialize-metadata [YOUR_TOKEN_ADDRESS] "100DaysCoin" "HUNDO" "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json"
   ```

   Replace `[YOUR_TOKEN_ADDRESS]` with the mint address from Step 1. Any name and symbol can be chosen.

3. **Create a token account.** Before holding any of the new token, a token account is needed. The mint is the factory that produces the token, and a token account is a wallet's individual bucket for holding that specific token. In Web2 terms, if the mint is a platform's rewards program definition, the token account is a specific user's balance entry in a database. This command creates an Associated Token Account (ATA) for my wallet. The ATA is a deterministic address derived from the wallet and the token mint, so any sender can find it without me sharing a custom address.

   **Run it:**

   ```bash
   spl-token create-account [YOUR_TOKEN_ADDRESS]
   ```

4. **Mint tokens into the account.** Now produce some supply. The mint command creates new tokens and deposits them into the token account. Because 6 decimals were set, minting 1000 means 1000 whole tokens (the CLI handles the decimal math).

   **Run it:**

   ```bash
   spl-token mint [YOUR_TOKEN_ADDRESS] 1000
   ```

5. **Check the balance.** Verify that the tokens landed in the account.

   **Run it:**

   ```bash
   spl-token balance [YOUR_TOKEN_ADDRESS]
   ```

   The expected result is 1000.

6. **Generate a second wallet and transfer tokens.** A token is not much use if it only sits in one account. Generate a second keypair to simulate distributing tokens to another user, then transfer some of the supply to that new wallet. The `--fund-recipient` flag tells the CLI to automatically create the recipient's associated token account if it does not exist yet, covering the small rent cost from my wallet.

   **Run it:**

   ```bash
   solana-keygen new --outfile ~/second-wallet.json --no-bip39-passphrase

   spl-token transfer [YOUR_TOKEN_ADDRESS] 250 $(solana-keygen pubkey ~/second-wallet.json) --fund-recipient --allow-unfunded-recipient
   ```

7. **Verify the transfer.** Check my balance again, and then check the recipient's balance to confirm the tokens moved.

   **Run it:**

   ```bash
   spl-token balance [YOUR_TOKEN_ADDRESS]

   spl-token balance --owner $(solana-keygen pubkey ~/second-wallet.json) [YOUR_TOKEN_ADDRESS]
   ```

   The expected result is 750 in my account and 250 in the second wallet.

## What Just Happened

I built a complete token from the ground up. Not just a faceless mint, but a token with a name, a symbol, and a metadata link, all stored directly on-chain using the Token Extensions metadata feature. I created an associated token account to hold it, minted supply, and transferred tokens to a second wallet.

Compare this to building a rewards system in Web2. You would define the currency in your database, assign it a name and display properties, create user balance records, and write transfer logic in your API. On Solana, the protocol handles all of that. The mint is the currency definition. The associated token account is the user's balance row. The transfer instruction is the API endpoint. But unlike a centralized database, every step is verifiable on-chain by anyone, and no single server controls the ledger.

The Token Extensions Program used today is the newer standard on Solana. It lets you embed metadata directly into the mint account rather than relying on a separate program to hold that information. This means fewer accounts, fewer transactions, and lower costs. Token Extensions will come up again for features like transfer fees, interest-bearing tokens, and confidential transfers.
