# Day 50: Creating a Token-2022 Mint With the Transfer Fee Extension

Mint address: `2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf`

## Steps

1. Confirm the CLI is pointed at devnet so I do not accidentally burn real SOL on this experiment.
2. Create a new fungible mint using the Token-2022 program and attach the Transfer Fee extension. I set a fee of 100 basis points (1 percent of every transfer) and a maximum fee cap of 1000000. The CLI reads this number as a UI amount, so the cap works out to 1,000,000 whole tokens, high enough that it never kicks in on a normal transfer and the full 1 percent applies every time.
3. Copy the mint address the CLI prints back. I need it for the next steps and for tomorrow's Build day.
4. Create an associated token account for myself so this mint has somewhere to land.
5. Mint a small starting supply to my own wallet so the token is not empty.
6. Display the mint and look for the TransferFeeConfig section in the output. That is the proof the middleware is on chain.

## Run it

Point at devnet and check the active keypair has some SOL:
```bash
solana config set --url https://api.devnet.solana.com
solana balance
```

Create the fee-bearing mint. The long string after `--program-id` is the on-chain address of the Token-2022 program:
```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  create-token \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 1000000 \
  --decimals 6
```

Save the mint address that gets printed. Then create a token account for it and mint a starting supply of 1,000 tokens:
```bash
spl-token create-account [YOUR_MINT_ADDRESS]
spl-token mint [YOUR_MINT_ADDRESS] 1000
```

Ask the chain to describe the mint:
```bash
spl-token display [YOUR_MINT_ADDRESS]
```

In the output, look for a section that reads `Extensions`. Inside it there should be `TransferFeeConfig` with the basis points and maximum fee. That is the on-chain receipt for the rule just baked in.

## Terminal session

```text
mint: 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana config set --url https://api.devnet.solana.com
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json
Commitment: confirmed
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana balance
13.83310648 SOL
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  create-token \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 1000000 \
  --decimals 6
Creating token 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
Decimals:  6

Signature: 5p36Df3J4yK8ZxX5g1Bcq4T9cn4HskiVTSUuvxCMoPjZK4pyCbnVHG3KPwf5KrKczdD6wuqgcrQ2jFN2C32orV58

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
Creating account HyvqtYjqb2qJosWSyhuvktiLRtyjXyBKR2fE4Y1uTMUw

Signature: 4tCbxL4y5BbiteKCUaVTXkBh41UkWLkz9RdUDWW66dqtV53dVoebMCbJS8HSiDow5vtf6nhikkYydfD2WsdJgswc

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf 1000
Minting 1000 tokens
  Token: 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
  Recipient: HyvqtYjqb2qJosWSyhuvktiLRtyjXyBKR2fE4Y1uTMUw

Signature: 5Jcyt7pAsyqqfWsd6dr6QfUmFELUzVPub5zuuWZ9dS7X9YqUYSLi1NEgR8yXE4y5BMz1E1CpGVZmx6w7L7cRAFAx

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf

SPL Token Mint
  Address: 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 1000000000
  Decimals: 6
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Transfer fees:
    Current fee: 100bps
    Current maximum: 1000000000000
    Config authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withdrawal authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withheld fees: 0
```
