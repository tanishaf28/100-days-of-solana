# Day 54: Testing the Non-Transferable Extension

Mint: `EjpwYkvixRR4QsRjiHif4nESjBvjzJXWPUqnTph6vsV3`

## Steps

1. Confirm the CLI is pointed at devnet and that I have some SOL to spend. I should be familiar with both of these commands by now from earlier in the arc.
2. Create a brand new mint with the non-transferable extension turned on. This is a one-shot flag on the `create-token` subcommand. Keep the mint address handy, it's needed for the next three steps.
3. Create an associated token account for that mint under my own wallet. This is the only account that will ever hold a balance of this token, and I'd see why in a moment.
4. Mint exactly one unit of the token into my own account. Treat it like awarding myself a badge.
5. Generate a throwaway recipient keypair for a second address to aim at. No need to fund it for this experiment, only its public key is needed.
6. Create the recipient's associated token account first, paying the rent myself since the throwaway wallet has no SOL. Then attempt to transfer my one token to it. Creating the account up front means the transfer actually reaches the program and is refused by the extension, instead of being refused by the CLI for an unrelated reason like a missing or unfunded destination account.
7. Read the error carefully, noting which program returned it and which instruction failed. This is the moment the extension earns its name.
8. For one last sanity check, run `spl-token display` against the mint and confirm the non-transferable line is present in the output. After yesterday's lesson on reading that output, today it should feel routine.

## Terminal session

```text
mint:  EjpwYkvixRR4QsRjiHif4nESjBvjzJXWPUqnTph6vsV3

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana config set --url https://api.devnet.solana.com
solana balance
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json
Commitment: confirmed
13.8083548 SOL
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-token --program-2022 --enable-non-transferable
Creating token EjpwYkvixRR4QsRjiHif4nESjBvjzJXWPUqnTph6vsV3 under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  EjpwYkvixRR4QsRjiHif4nESjBvjzJXWPUqnTph6vsV3
Decimals:  9

Signature: 623JGHmwAvnvAVsx2bLtiK4NwWKgiQ8h72cTVTWxViC649FYmJpzCZs4rpeGHVrpQHNwk5osxZMUDo8LSD9MeB1W

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ export MINT=EjpwYkvixRR4QsRjiHif4nESjBvjzJXWPUqnTph6vsV3
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account $MINT
Creating account AMSr7cFsdMaSD5N1dFqbmZ7xasWHGobkEP7J7tfq6Yzq

Signature: 3E9pvP4RM3HHknW6zsoqFVPyjdbvgS4bbJoTeKGLDuRXdpt4KwkvgGdF25akegL67iNxnzn4kH8CcAPr9qqGJYmS

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint $MINT 1
Minting 1 tokens
  Token: EjpwYkvixRR4QsRjiHif4nESjBvjzJXWPUqnTph6vsV3
  Recipient: AMSr7cFsdMaSD5N1dFqbmZ7xasWHGobkEP7J7tfq6Yzq

Signature: 3Nfsh6Ygm5x1fAfvrcUtP8wKutFBej1iV7QKk9h9oJEw89q878cCxDedkaTn1MxFrcyR2i2f51Sjb1KQeVu8iDC2

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana-keygen new --no-bip39-passphrase --outfile /tmp/recipient.json --force
export RECIPIENT=$(solana-keygen pubkey /tmp/recipient.json)
Generating a new keypair
Wrote new keypair to /tmp/recipient.json
================================================================================
pubkey: Ax2fPw7GSTM742C8H85C8BwtXP3uUiZSVBi4ptebVHFb
================================================================================
Save this seed phrase to recover your new keypair:
scorpion elegant jungle project orphan swallow vast sad note arrest coast result
================================================================================
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account $MINT --owner $RECIPIENT --fee-payer ~/.config/solana/id.json
spl-token transfer $MINT 1 $RECIPIENT --allow-unfunded-recipient
Creating account 9weQHEKAkH9shVzvVBNDAGCJWhMnasSX1NVM23biPhhx

Signature: g8FHd9WLe2PNeX3Cinb4UjHiEsyA6VQu5ytzjb4AUEjrdhJVnd48hsWnemHFv2C6JFzPHDgJ1Dv66R6dpXcmFsq

Transfer 1 tokens
  Sender: AMSr7cFsdMaSD5N1dFqbmZ7xasWHGobkEP7J7tfq6Yzq
  Recipient: Ax2fPw7GSTM742C8H85C8BwtXP3uUiZSVBi4ptebVHFb
  Recipient associated token account: 9weQHEKAkH9shVzvVBNDAGCJWhMnasSX1NVM23biPhhx
Error: Client(Error { request: Some(SendTransaction), kind: RpcError(RpcResponseError { code: -32002, message: "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x25", data: SendTransactionPreflightFailure(RpcSimulateTransactionResult { err: Some(UiTransactionError(InstructionError(0, Custom(37)))), logs: Some(["Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb invoke [1]", "Program log: Instruction: TransferChecked", "Program log: Transfer is disabled for this mint", "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb consumed 1570 of 1570 compute units", "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb failed: custom program error: 0x25"]), accounts: None, units_consumed: Some(1570), loaded_accounts_data_size: Some(712077), return_data: None, inner_instructions: None, replacement_blockhash: None, fee: Some(5000), pre_balances: None, post_balances: None, pre_token_balances: None, post_token_balances: None, loaded_addresses: None }) }) })
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display $MINT

SPL Token Mint
  Address: EjpwYkvixRR4QsRjiHif4nESjBvjzJXWPUqnTph6vsV3
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 1000000000
  Decimals: 9
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Non-transferable
```

The transfer was rejected directly by the Token-2022 program (custom error `0x25`, `TransferChecked` instruction) with the log line `Transfer is disabled for this mint`, confirming the non-transferable extension is enforced at the program level, not just in the CLI.
