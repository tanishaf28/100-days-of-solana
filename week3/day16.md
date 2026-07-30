# Day 16: Sending My First SOL Transfer

## Steps

1. Confirm the CLI is pointed at devnet. Devnet is Solana's testing network where I can experiment freely with no real money at stake.

   ```bash
   solana config set -ud
   ```

   Then verify the configuration:

   ```bash
   solana config get
   ```

   I should see `RPC URL: https://api.devnet.solana.com` in the output.

2. Check the current balance:

   ```bash
   solana balance
   ```

   If the balance is zero or too low, airdrop some devnet SOL:

   ```bash
   solana airdrop 2
   ```

   This gives 2 SOL on devnet to work with. Devnet airdrops are capped at 5 SOL per request. If rate-limited, the Solana Web Faucet works as a backup.

3. Generate a second keypair to use as the recipient. I need someone to send SOL to. Create a throwaway keypair:

   ```bash
   solana-keygen new --outfile ~/recipient-keypair.json --no-bip39-passphrase
   ```

   Note the public key it outputs, that is the recipient address.

4. Send the transfer (replace `<RECIPIENT>` with the public key from the previous step):

   ```bash
   solana transfer <RECIPIENT> 0.5 --allow-unfunded-recipient
   ```

   The `--allow-unfunded-recipient` flag is necessary because the new recipient address has never received SOL before and does not yet have an account on-chain. Without this flag, the CLI would reject the transfer as a safety measure.

5. Verify the transfer landed. Check my own balance and the recipient's balance:

   ```bash
   solana balance
   solana balance <RECIPIENT>
   ```

   My balance should be roughly 1.5 SOL (2 minus 0.5, minus a tiny transaction fee). The recipient should show 0.5 SOL.

6. Look up the transaction on the explorer. When I ran the transfer command, the CLI printed a transaction signature (a long string of characters). Copy it and open this URL in the browser, replacing `<SIGNATURE>` with the actual signature:

   ```text
   https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
   ```

   Browse the transaction details: sender, recipient, amount, fee, and the block it was included in.

## Run It

Here is the full sequence from start to finish:

```bash
solana config set -ud
solana airdrop 2
solana-keygen new --outfile ~/recipient-keypair.json --no-bip39-passphrase
solana transfer <RECIPIENT> 0.5 --allow-unfunded-recipient
solana balance
solana balance <RECIPIENT>
```
