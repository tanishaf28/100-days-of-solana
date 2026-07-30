# Day 3: Verifying Balances and Fees with the Solana CLI

## Today's Challenge

I opened a terminal and queried my devnet wallet's balance using the Solana CLI:

```bash
solana balance --url devnet
```

That gives SOL. Then I got the raw lamport value:

```bash
solana balance --url devnet --lamports
```

## Steps

1. Confirm the math: multiply the SOL value by 1,000,000,000. The two numbers should match exactly.
2. If the balance is zero, request an airdrop first:

   ```bash
   solana airdrop 2 --url devnet
   ```

   Note: the devnet airdrop can sometimes fail due to rate limiting. If this happens, try a smaller amount (`solana airdrop 1 --url devnet`) or use the web faucet instead. I can find my address by running `solana address`.

3. Look up the most recent transaction on my account:

   ```bash
   solana transaction-history $(solana address) --url devnet --limit 1
   ```

4. Take the transaction signature from the output and inspect it:

   ```bash
   solana confirm SIGNATURE_HERE -v --url devnet
   ```

5. Find the `fee` field in that output. It's in lamports. Divide by `LAMPORTS_PER_SOL` (1,000,000,000) to see what I paid in SOL. For a simple transaction, it should be 0.000005 SOL, or five thousand lamports.
