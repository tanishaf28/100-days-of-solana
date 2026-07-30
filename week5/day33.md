# Day 33: Non-Transferable (Soulbound) Tokens

- mint addr: HgHZkpoNKzmW7AL162NRL5ALqy3ewqS1c2w9yM7EH2E8
- token addr: 2joYCLK6QTfQ1FwsKijU7dMn2CDM8r6YZ3asoVxGL61j
- second keypair: AdaoygGhDgfpT9fUrGwYosZsHP2rjcVzKdsNwhhaZFvw

## Terminal Session

```text
_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana config set --url devnet
solana balance
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com 
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json 
Commitment: confirmed 
13.8893092 SOL
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-non-transferable
Creating token HgHZkpoNKzmW7AL162NRL5ALqy3ewqS1c2w9yM7EH2E8 under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  HgHZkpoNKzmW7AL162NRL5ALqy3ewqS1c2w9yM7EH2E8
Decimals:  9

Signature: 2poTz7Cg4ZosW8qqugCCCicagqKVHsZaovgDrqS2T84Nbaws2jGK9pJzGxTE6mmip8gWo55NSDdzZVW7AbLX7Tp8

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account  HgHZkpoNKzmW7AL162NRL5ALqy3ewqS1c2w9yM7EH2E8 --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
Creating account 2joYCLK6QTfQ1FwsKijU7dMn2CDM8r6YZ3asoVxGL61j

Signature: 29KKSJkukvecq8nDAgQ5qJdqcGmAZsebSCywqNPZFMfpvgsRVvmuWgAzXv41DjXtfYrqnJnLUpSbSeLCPc9unkE8

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint HgHZkpoNKzmW7AL162NRL5ALqy3ewqS1c2w9yM7EH2E8 10 --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
Minting 10 tokens
  Token: HgHZkpoNKzmW7AL162NRL5ALqy3ewqS1c2w9yM7EH2E8
  Recipient: 2joYCLK6QTfQ1FwsKijU7dMn2CDM8r6YZ3asoVxGL61j

Signature: 3E95q3D8gNRUVyRJohgxLRYBYwnMnSdvVBLJ3JAhk1fGoHtE2HUWBvg2Ug25zTJZH4PMBmgvCY58kasncv5wycff

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token balance HgHZkpoNKzmW7AL162NRL5ALqy3ewqS1c2w9yM7EH2E8 --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
10

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana-keygen new --outfile ~/experiment-wallet.json --no-bip39-passphrase --force
Generating a new keypair
Wrote new keypair to /home/t_fonsec/experiment-wallet.json
=====================================================================================
pubkey: CoGPKyw63znoBcv6z47fj7qHFKXAtPXVtX46YHkv6wBe
=====================================================================================
Save this seed phrase to recover your new keypair:
abstract anxiety defense impact bench dream business roast sick hollow language badge
=====================================================================================
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account HgHZkpoNKzmW7AL162NRL5ALqy3ewqS1c2w9yM7EH2E8 --owner ~/experiment-wallet.json --fee-payer ~/.config/solana/id.json --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
Creating account AdaoygGhDgfpT9fUrGwYosZsHP2rjcVzKdsNwhhaZFvw

Signature: 266A9USubYUoc4Fvvn362VCzgZz6kctWP8TFsgS6wwZXn2wJStxef3RVsy5PBNCY34h9zraNxmraBQUYc5bG7wX5

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token transfer HgHZkpoNKzmW7AL162NRL5ALqy3ewqS1c2w9yM7EH2E8  5  AdaoygGhDgfpT9fUrGwYosZsHP2rjcVzKdsNwhhaZFvw --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --allow-unfunded-recipient
Transfer 5 tokens
  Sender: 2joYCLK6QTfQ1FwsKijU7dMn2CDM8r6YZ3asoVxGL61j
  Recipient: AdaoygGhDgfpT9fUrGwYosZsHP2rjcVzKdsNwhhaZFvw
Error: Client(Error { request: Some(SendTransaction), kind: RpcError(RpcResponseError { code: -32002, message: "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x25", data: SendTransactionPreflightFailure(RpcSimulateTransactionResult { err: Some(UiTransactionError(InstructionError(0, Custom(37)))), logs: Some(["Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb invoke [1]", "Program log: Instruction: TransferChecked", "Program log: Transfer is disabled for this mint", "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb consumed 1570 of 1570 compute units", "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb failed: custom program error: 0x25"]), accounts: None, units_consumed: Some(1570), loaded_accounts_data_size: Some(712077), return_data: None, inner_instructions: None, replacement_blockhash: None, fee: Some(5000), pre_balances: None, post_balances: None, pre_token_balances: None, post_token_balances: None, loaded_addresses: None }) }) })

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token burn 2joYCLK6QTfQ1FwsKijU7dMn2CDM8r6YZ3asoVxGL61j 3 --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
Burn 3 tokens
  Source: 2joYCLK6QTfQ1FwsKijU7dMn2CDM8r6YZ3asoVxGL61j

Signature: JKhiSePywqWxqX2TBamsFnKt61SFNbvuyXyMrY2HSo9KdPPKzHnAC928feDHJfPKz65XEH2CK5qvUTexwFURDKG

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token balance HgHZkpoNKzmW7AL162NRL5ALqy3ewqS1c2w9yM7EH2E8 --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
7

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$
```

## Scenario

I have accomplished quite a lot so far: created a mint, added metadata, attached transfer fees, and sent tokens between wallets. Every token made so far is designed to flow from one account to another. That is the default behavior, and it mirrors what most people expect from digital assets.

But think about Web2 experience for a moment. Not everything in a platform is meant to be transferred. A verified badge on a social profile cannot be sold to someone else. A course completion certificate belongs to the person who earned it. An employee ID does not change hands. These are credentials, not currencies. Their value comes from who holds them, not from being tradeable.

Solana's Token Extensions Program has a built-in answer for this: the non-transferable extension. When enabled on a mint, every token created from that mint is permanently locked to the wallet it lands in. No transfers, no secondary markets, no workarounds. The blockchain enforces it at the protocol level. Today, I experimented with creating one of these "soulbound" tokens, minted it, and then tried to transfer it just to watch it fail. That failure is the whole point.

## Challenge

### What I'll Need

- A terminal with the Solana CLI installed
- The spl-token CLI installed
- A Solana keypair configured for devnet
- Devnet SOL in the wallet (use `solana airdrop 2` if needed)

## Steps

1. **Confirm the setup.** Make sure I am on devnet and have SOL to work with.

   ```bash
   solana config set --url devnet
   solana balance
   ```

   If the balance is low, request an airdrop:

   ```bash
   solana airdrop 2
   ```

   > Note: The devnet airdrop can sometimes fail due to rate limiting. If this happens use the web faucet instead.

2. **Create a non-transferable token mint.** This is where the experiment begins: a new token mint using the Token Extensions Program (Token-2022), but this time with the `--enable-non-transferable` flag. This flag tells the program to permanently prevent any token minted from this mint from being transferred between wallets.

   **Run it:**

   ```bash
   spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-non-transferable
   ```

   The mint address from the output gets copied for the next steps.

3. **Create a token account and mint some tokens.** Even though these tokens cannot be transferred, a token account is still needed to hold them. Create one and mint a supply to it:

   ```bash
   spl-token create-account YOUR_MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
   spl-token mint YOUR_MINT_ADDRESS 10 --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
   ```

   That should give 10 tokens sitting in my wallet. Check the balance to confirm:

   ```bash
   spl-token balance YOUR_MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
   ```

4. **Try to transfer. Watch it fail.** Now for the experiment: generate a second keypair to act as another wallet, create a token account for it, and then try to send tokens to it:

   ```bash
   solana-keygen new --outfile ~/experiment-wallet.json --no-bip39-passphrase --force
   spl-token create-account YOUR_MINT_ADDRESS --owner ~/experiment-wallet.json --fee-payer ~/.config/solana/id.json --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
   spl-token transfer YOUR_MINT_ADDRESS 5 EXPERIMENT_WALLET_PUBLIC_KEY --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --allow-unfunded-recipient
   ```

   That last command should fail. The error says the transfer is not allowed. This is not a bug. This is the non-transferable extension doing exactly what it is designed to do. The blockchain itself rejects the transaction.

5. **Prove that burning still works.** Non-transferable does not mean non-destructible. The token owner can still burn tokens they hold.

   ```bash
   spl-token burn YOUR_TOKEN_ACCOUNT_ADDRESS 3 --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
   ```

   Checking the balance again:

   ```bash
   spl-token balance YOUR_MINT_ADDRESS --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
   ```

   The result was 7 tokens. The burn went through. The transfer did not. That distinction is what makes non-transferable tokens useful.
