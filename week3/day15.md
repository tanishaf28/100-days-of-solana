# Day 15: Anatomy of a Solana Transaction

## Steps

1. Send a quick transfer on devnet so I have a transaction to inspect. This is my first time sending SOL, so I paid attention to what happened:

   ```bash
   solana-keygen new --no-bip39-passphrase -o /tmp/temp-wallet.json
   solana transfer --allow-unfunded-recipient $(solana address -k /tmp/temp-wallet.json) 0.001 --url devnet
   ```

2. Copy the transaction signature that gets printed to the terminal. It looks like a long base-58 string. This signature is not just a receipt, it is the first signature in the transaction and doubles as the transaction's unique ID.

3. Inspect the transaction with the CLI. Use the `solana confirm` command with the verbose flag to pull apart the transaction:

   ```bash
   solana confirm -v YOUR_TRANSACTION_SIGNATURE
   ```

   The output includes the transaction's status, the slot it was processed in, the accounts involved, and the instructions that were executed. I took a moment to read through it.

4. Open it in Solana Explorer. Paste the transaction signature into the search bar at explorer.solana.com. Make sure to switch the cluster to "Devnet" using the dropdown at the top of the page. The Explorer gives a visual breakdown of the same data. Sections to look for:
   - **Signature(s):** The Ed25519 signatures that authorize this transaction. Each is 64 bytes. A simple transfer has one signature (from the wallet). The first signature is also the transaction ID.
   - **Account Keys:** The list of public keys for every account the transaction touches. Notice how they are grouped: the fee payer comes first, then other signers, then read-only accounts. This ordering is not random, it maps to the message header.
   - **Recent Blockhash:** A 32-byte hash of a recent block. This serves two purposes: it proves the transaction was created recently (blockhashes expire after about 150 slots, roughly 60-90 seconds), and it prevents the exact same transaction from being processed twice.
   - **Instruction(s):** The actual operations. A transfer has one instruction that invokes the System Program with a "Transfer" command, the source account, the destination account, and the amount in lamports.

5. Map it to the official structure. Every Solana transaction is made up of two top-level parts:
   - **Signatures:** A compact array of 64-byte Ed25519 signatures. The number of signatures must match the `num_required_signatures` value in the message header.
   - **Message:** The payload that was signed. It contains:
     - **Header:** Three single-byte numbers describing how many signatures are required, how many of those signers are read-only, and how many unsigned accounts are read-only. These three numbers partition the account keys array into permission groups without needing per-account metadata flags.
     - **Account Keys:** A compact array of 32-byte public keys for every account referenced by any instruction.
     - **Recent Blockhash:** The 32-byte blockhash described above.
     - **Instructions:** A compact array of compiled instructions. Each compiled instruction contains a program ID index (pointing into the account keys array), an array of account indexes (also pointing into account keys), and a data byte array that the program interprets.

   The entire serialized transaction must fit within 1,232 bytes. That limit comes from the IPv6 minimum MTU (1,280 bytes) minus 48 bytes of network headers. It is one of the tightest constraints in Solana development and the reason Address Lookup Tables exist for complex transactions.

## Comparing It to HTTP

- The message header is like HTTP headers, providing metadata about permissions and structure.
- The account keys are like the URL paths and query parameters, telling the network which resources are involved.
- The instructions are like the request body, containing the actual operations you want performed.
- The signatures are like authentication tokens, providing proof that the sender authorized this request.
- The recent blockhash is like a CSRF token with a short expiry, preventing replay attacks and proving freshness.

The key difference: HTTP requests are processed by one server. Solana transactions are validated by every validator in the network, and if any instruction in the transaction fails, all of them are rolled back atomically. Fees are still charged even on failure.
