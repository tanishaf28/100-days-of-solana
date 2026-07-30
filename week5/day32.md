# Day 32: Combine Transfer Fees and Metadata in One Mint

## Terminal Session

```text
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana config set --url devnet
solana balance
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com 
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json 
Commitment: confirmed 
13.89837632 SOL
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --transfer-fee-basis-points 200 --transfer-fee-maximum-fee 5000 --enable-metadata --decimals 9
Creating token 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize metadata inside the mint, please run `spl-token initialize-metadata 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.

Address:  9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
Decimals:  9

Signature: 4FvoN9Wo3NMqojmkj4dSPEoJvpmjGcF54khmDvbThk48HY9TycNNSJEmDWxj2Pz4s4cJDZBuYh6s8MP8cv8bwxoq

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token initialize-metadata 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA "ReinforceCoin" "RFC" "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json"

Signature: pY38j4cgrmFBddtNqiSXBX6VhUUGNeSDmAGSDBxS7u38qanQhBFtfg31cC43x3T7c5gZrsen24HyzR6EcnwGGDa

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA

SPL Token Mint
  Address: 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 0
  Decimals: 9
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Transfer fees:
    Current fee: 200bps
    Current maximum: 5000000000000
    Config authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withdrawal authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withheld fees: 0
  Metadata Pointer:
    Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Metadata address: 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
  Metadata:
    Update Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Mint: 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
    Name: ReinforceCoin
    Symbol: RFC
    URI: https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json

    t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
Creating account 2wxczjLFYBLFRjY7f56BysbizuM2uZpZ5oVRJYXfJuj3

Signature: iU3oDg7ofJiNYxX7dqZu5SuPzAcFPEQFVmaXLAQXe4mYRkUocZkLTRr4nzthwUQ1qyDPnocQRfyCCw6k6mjJewA
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint  9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA 1000
Minting 1000 tokens
  Token: 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
  Recipient: 2wxczjLFYBLFRjY7f56BysbizuM2uZpZ5oVRJYXfJuj3

Signature: 2y2ibk7mrxHz3cmFy2jVSmuLrnFsgu5h4U4KindzW96JYNpNmbMZXZTQ9sjUXLeyPWtGsxU3hDTrDqQTfmqSzrRv

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token balance 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
1000

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA --owner 2wxczjLFYBLFRjY7f56BysbizuM2uZpZ5oVRJYXfJuj3 --fee-payer ~/.config/solana/id.json
Creating account E6ZQp5mF3uJRuJPZjvSyqfPq3PEWDswuPVquDC6BSaT1

Signature: 2mEryyFqVKarbk3kvq8vA2RouJjMu29MGN7ffmGpjiMpN9NrCBMVmEgs892GhdKtBnJ6H6gVvMTAys5qAPdsVbQE

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token transfer --fund-recipient 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA  100 E6ZQp5mF3uJRuJPZjvSyqfPq3PEWDswuPVquDC6BSaT1 --expected-fee 2 --allow-unfunded-recipient
Transfer 100 tokens
  Sender: 2wxczjLFYBLFRjY7f56BysbizuM2uZpZ5oVRJYXfJuj3
  Recipient: E6ZQp5mF3uJRuJPZjvSyqfPq3PEWDswuPVquDC6BSaT1

Signature: 4wRJvzsrTRZV3mNZSfqzyq14LG5Hesx6jxbGEo5fTovo7TjUwgiyBEpwG93ZK4UkhR55vMrm2sFoRdts3Rzqs6Na
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token balance --owner 2wxczjLFYBLFRjY7f56BysbizuM2uZpZ5oVRJYXfJuj3 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
98
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token withdraw-withheld-tokens 2wxczjLFYBLFRjY7f56BysbizuM2uZpZ5oVRJYXfJuj3 E6ZQp5mF3uJRuJPZjvSyqfPq3PEWDswuPVquDC6BSaT1

Signature: w3wWrSqQyDhv5p74BHj711uiWYzEGQaFAnVvFy9c1n4QqQEqUCwBDMQ9suomoEvRGzEa4VkSWJYktDUqVuhgxFD

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA

SPL Token Mint
  Address: 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 1000000000000
  Decimals: 9
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Transfer fees:
    Current fee: 200bps
    Current maximum: 5000000000000
    Config authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withdrawal authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withheld fees: 0
  Metadata Pointer:
    Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Metadata address: 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
  Metadata:
    Update Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Mint: 9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA
    Name: ReinforceCoin
    Symbol: RFC
    URI: https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json
```

## Steps

1. **Confirm my environment.** Before starting, verify that the CLI is pointed at devnet and my wallet has funds. This is the equivalent of checking that a local dev server is running before writing code.

   **Run it:**

   ```bash
   solana config set --url devnet
   ```

   ```bash
   solana balance
   ```

   If the balance is below 2 SOL, request an airdrop:

   ```bash
   solana airdrop 2
   ```

   > Note: The devnet airdrop can sometimes fail due to rate limiting. If this happens use the web faucet instead.

2. **Create a token with transfer fees in a single command.** On Day 29, I created a plain token. On Day 31, I created one with a transfer fee extension. Today, I combined what I knew: a new token using the Token Extensions Program (Token-2022) with a transfer fee baked in from the start. The fee was set to 200 basis points (2%) with a maximum fee of 5000 tokens (in the smallest unit).

   **Run it:**

   ```bash
   spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --transfer-fee-basis-points 200 --transfer-fee-maximum-fee 5000 --enable-metadata --decimals 9
   ```

   The mint address printed here gets used in every step that follows.

3. **Add metadata to the token.** On Day 30, I learned that a token without metadata is just an address. Give the token an identity by initializing its metadata extension with a name, symbol, and URI. This must happen before minting any supply, because `initialize-metadata` requires zero supply on the mint.

   **Run it:**

   ```bash
   spl-token initialize-metadata [YOUR_MINT_ADDRESS] "ReinforceCoin" "RFC" "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json"
   ```

   Then confirm it took effect:

   ```bash
   spl-token display [YOUR_MINT_ADDRESS]
   ```

   The token's name, symbol, and URI show up in the output alongside the transfer fee configuration. Two extensions, one mint.

4. **Create a token account and mint supply.** A mint on its own holds no tokens. A token account is needed to hold the supply. Create one, then mint 1,000 tokens to it.

   **Run it:**

   ```bash
   spl-token create-account [YOUR_MINT_ADDRESS]
   ```

   ```bash
   spl-token mint [YOUR_MINT_ADDRESS] 1000
   ```

   Verify the balance:

   ```bash
   spl-token balance [YOUR_MINT_ADDRESS]
   ```

   The expected result is 1000. This is the same flow as Day 29, but now with the Token-2022 program running behind it.

5. **Create a token account for the second wallet.** A destination is needed for the transfer. Create a token account owned by the second keypair:

   ```bash
   spl-token create-account [YOUR_MINT_ADDRESS] --owner [RECIPIENT_WALLET_ADDRESS] --fee-payer ~/.config/solana/id.json
   ```

6. **Transfer tokens and observe the fee.** Now test the transfer fee in action. Send 100 tokens to the second wallet. Because the fee was configured at 2%, the recipient should receive 98 tokens, and 2 tokens should be withheld in their token account.

   **Run it:**

   ```bash
   spl-token transfer --fund-recipient [YOUR_MINT_ADDRESS] 100 [RECIPIENT_WALLET_ADDRESS] --expected-fee 2 --allow-unfunded-recipient
   ```

   Check what the recipient actually received:

   ```bash
   spl-token balance --owner [RECIPIENT_WALLET_ADDRESS] [YOUR_MINT_ADDRESS]
   ```

   The balance should read 98. The remaining 2 tokens are withheld in the recipient's token account, untouchable by the recipient, waiting for the withdraw authority (me) to collect them.

7. **Collect the withheld fees.** Fees sitting in individual token accounts are not useful until collected. Use the `withdraw-withheld-tokens` command to pull the withheld fees from the recipient's account into my own.

   **Run it:**

   ```bash
   spl-token withdraw-withheld-tokens [YOUR_TOKEN_ACCOUNT_ADDRESS] [RECIPIENT_TOKEN_ACCOUNT_ADDRESS]
   ```

   Then check the balance again:

   ```bash
   spl-token balance [YOUR_MINT_ADDRESS]
   ```

   The balance should now reflect the original 900 tokens kept, plus the 2 tokens collected as fees: 902 total.

8. **Review the full picture.** Run the display command one more time and read through the full output:

   ```bash
   spl-token display [YOUR_MINT_ADDRESS]
   ```

   What was built in a single session:

   - A token created under the Token-2022 program
   - A transfer fee extension enforcing a 2% fee at the protocol level
   - Metadata giving the token a name, symbol, and URI
   - Minted supply distributed across accounts
   - Collected fees from transfers

   That is the full lifecycle. No backend server. No middleware. No payment processor. Just on-chain configuration.
