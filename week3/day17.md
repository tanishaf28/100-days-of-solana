# Day 17: Building a SOL Transfer Tool

## Steps

1. Set up the project.

   Create a new directory for the transfer tool and initialize it:

   ```bash
   mkdir sol-transfer-tool && cd sol-transfer-tool
   npm init -y
   npm install @solana/kit @solana-program/system
   ```

   The `@solana/kit` package is the modern Solana JavaScript SDK (formerly known as `@solana/web3.js` 2.0). It is tree-shakable, has zero external dependencies, and uses BigInt for all amounts to match how Solana programs handle numbers in Rust. The `@solana-program/system` package provides typed helpers for the System Program, including the transfer instruction needed here.

   Open `package.json` and add `"type": "module"` so ES module imports can be used:

   ```json
   {
   	"name": "sol-transfer-tool",
   	"version": "1.0.0",
   	"type": "module"
   }
   ```

2. Build the transfer tool.

   Create a file called `transfer.mjs` and add the code, reading through each section before pasting it in. The inline comments explain what each part does.

   See the code in this gist.

3. Generate a second address to receive the transfer.

   I need a recipient address. Open a second terminal and generate a fresh keypair using the Solana CLI:

   ```bash
   solana-keygen new --outfile ~/.config/solana/recipient.json --no-bip39-passphrase
   ```

   Copy the public key it prints, that is the address to pass to the tool.

## Run It

With devnet SOL in the default wallet, run the tool with the recipient address and an amount:

```bash
node transfer.mjs <RECIPIENT> 0.05
```

Expected output:

```text
Solana Transfer Tool
====================
Connected to Solana devnet.
Sender: YourPublicKeyHere...
Recipient: RecipientPublicKeyHere...
Amount: 0.05 SOL
Sender balance: 1.5 SOL
Sending transaction...
Transaction confirmed!
Signature: 5Uh3...abc
Explorer:  https://explorer.solana.com/tx/5Uh3...abc?cluster=devnet
New sender balance: 1.4499... SOL
```
