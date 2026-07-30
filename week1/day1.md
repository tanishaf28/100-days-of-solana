# Day 1: Generating My First Solana Wallet

## Steps

1. In my project folder, I created a new file called `create-wallet.mjs`:

   ```javascript
   import { generateKeyPairSigner } from "@solana/kit";

   // Generate a brand new keypair
   const wallet = await generateKeyPairSigner();

   console.log("Your new wallet address:", wallet.address);
   console.log(
     "\nThis address is your public key. It's safe to share."
   );
   console.log(
     "The private key stays in memory. In a real app, you'd save it securely."
   );
   ```

2. I ran it:

   ```bash
   node create-wallet.mjs
   ```

   A new Solana address printed to the terminal. Every time I run this script, I get a different address, since it generates a fresh keypair each time.

3. I copied the address from the terminal output, went to faucet.solana.com, made sure "Devnet" was selected, pasted my address, and requested an airdrop. The faucet sends free test SOL to the new address.

4. I updated the script to verify the funds arrived by checking the balance after funding:

   ```javascript
   import {
     generateKeyPairSigner,
     createSolanaRpc,
     devnet,
   } from "@solana/kit";

   const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
   const wallet = await generateKeyPairSigner();

   console.log("Wallet address:", wallet.address);
   console.log("\n--- Go to https://faucet.solana.com/ and airdrop SOL to this address ---");
   console.log("--- Then run this script again with the same address to check the balance ---\n");

   // To check a specific address you've already funded, replace the line below:
   // const { value: balance } = await rpc.getBalance(address("YOUR_ADDRESS_HERE")).send();
   const { value: balance } = await rpc.getBalance(wallet.address).send();
   const balanceInSol = Number(balance) / 1_000_000_000;

   console.log(`Balance: ${balanceInSol} SOL`);
   ```

## Note

Since `generateKeyPairSigner()` creates a new keypair every time, the second run shows a fresh, unfunded wallet. To check the balance of the address I already funded, I need to import `address` from `@solana/kit` and replace `wallet.address` with `address("YOUR_FUNDED_ADDRESS")` in the `getBalance` call. I'll solve this persistence problem on Day 2.
