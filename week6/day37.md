# Day 37: Combine Transfer Fees, Interest, and Metadata in One Mint

- MINT: 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
- TOKEN: DFELkyawFKCCcfowAbxLVwVtkkRairJL4SbCZi4gSXk2
- SECOND WALLET: BLPeDG4MjqgrkPYreaXmZV1ZjXdsmbcAzRTmkVdNf4nA

## Terminal Session

```text
PS C:\Users\T_fonsec\solana> wsl
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  create-token \
  --decimals 2 \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 500 \
  --interest-rate 5 \
  --enable-metadata
Creating token 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize metadata inside the mint, please run `spl-token initialize-metadata 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.

Address:  8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
Decimals:  2

Signature: 5sqTp1cWbhN2n6XipNVbYP16GbbSR3ung4ZXU7uRrjpbmmoeJsXhcgGZGqpGnKDsgAcyFsCGvvpUr2z5SbNPu5ka

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token initialize-metadata \                                                      8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK \                                                          
  "ArcCoin" \
  "ARC" \
  "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json"

Signature: 5x21axQGxE1pH6gZQpYW8ForVPFhyx8buD76Jx7QzEwxdhpMc8ETjZMjTdTfMZyZqd3hxrGLp3KnSrbpzhsCSr8v

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK

SPL Token Mint
  Address: 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 0
  Decimals: 2
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Interest-bearing:
    Current rate: 5bps
    Average rate: 5bps
    Rate authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Transfer fees:
    Current fee: 100bps
    Current maximum: 50000
    Config authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withdrawal authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withheld fees: 0
  Metadata Pointer:
    Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Metadata address: 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
  Metadata:
    Update Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Mint: 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
    Name: ArcCoin
    Symbol: ARC
    URI: https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json
    t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account  8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
Creating account DFELkyawFKCCcfowAbxLVwVtkkRairJL4SbCZi4gSXk2

Signature: 5ZKTvfi9Fp8JVznwBavmsF4ndhvxs38BWeD912LnVxviy7KXrQns1k5o4cjZaFRSP4s6Ku8NPKq26PK81k7u93fd

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint  8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK 1000
Minting 1000 tokens
  Token: 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
  Recipient: DFELkyawFKCCcfowAbxLVwVtkkRairJL4SbCZi4gSXk2

Signature: 5nNHwAEyWHBLmgJFGV88xo6xEwH7Ngjn85VZfLgc4ZKuX8qGbNTwwzUyMnKwrG8wjx28PFDvs5paerb6nMYszNYk

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana-keygen new --outfile ~/second-wallet.json --no-bip39-passphrase --force
Generating a new keypair
Wrote new keypair to /home/t_fonsec/second-wallet.json
==============================================================================
pubkey: MpZwPqxB1tHSLtx1mRdXJwbpMo92WWyXZLsbcmqHydk
==============================================================================
Save this seed phrase to recover your new keypair:
luggage student sample science mix that lazy donor crisp paper flavor indicate
==============================================================================
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK  --owner ~/second-wallet.json --fee-payer ~/.config/solana/id.json
Creating account BLPeDG4MjqgrkPYreaXmZV1ZjXdsmbcAzRTmkVdNf4nA

Signature: 3FW6AoYxAaGT8jKegJ22rymE3aqGDUJYfsW8f2ZwLp7rDpqL81eTnZXxDvgsKxbPBG2LwTGH7gKKiagp888zqKkP

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token transfer 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK 100 ~/second-wallet.json --expected-fee 1 --allow-unfunded-recipient
Transfer 100 tokens
  Sender: DFELkyawFKCCcfowAbxLVwVtkkRairJL4SbCZi4gSXk2
  Recipient: MpZwPqxB1tHSLtx1mRdXJwbpMo92WWyXZLsbcmqHydk
  Recipient associated token account: BLPeDG4MjqgrkPYreaXmZV1ZjXdsmbcAzRTmkVdNf4nA

Signature: 5oAWczTFCBJja7WKxUzqC67BcGMBxjoEKZ4kwRZwjXDVPdYCRHihZBHeZo4zjbb8wrvn28ZDcJ5XfGWKEwTjmGvm

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token balance 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
900

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token balance 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK --owner ~/second-wallet.json
99

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK

SPL Token Mint
  Address: 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 100000
  Decimals: 2
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Interest-bearing:
    Current rate: 5bps
    Average rate: 5bps
    Rate authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Transfer fees:
    Current fee: 100bps
    Current maximum: 50000
    Config authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withdrawal authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withheld fees: 0
  Metadata Pointer:
    Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Metadata address: 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
  Metadata:
    Update Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Mint: 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
    Name: ArcCoin
    Symbol: ARC
    URI: https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token accounts --owner ~/second-wallet.json -v
Program                                       Token                                         Account                                       Delegated  Close Authority  Balance
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb   8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK  BLPeDG4MjqgrkPYreaXmZV1ZjXdsmbcAzRTmkVdNf4nA                              99
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token withdraw-withheld-tokens DFELkyawFKCCcfowAbxLVwVtkkRairJL4SbCZi4gSXk2  Mp
ZwPqxB1tHSLtx1mRdXJwbpMo92WWyXZLsbcmqHydk

Signature: 5LBtofckSdfHHsVM6mvvkvKnxX64AgfyvVqdXYXS1KerRZLk68rhQuv2Loixo5ydocTxBPuQiHt6Tt3HfTUvJLEQ
```

## Steps

1. **Create the multi-extension mint.** A single token mint with three extensions enabled at once: transfer fees, an interest-bearing rate, and a metadata pointer. The CLI calculates the total account size needed for all the extension data and allocates it in one transaction.

   **Run it:**

   ```bash
   spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
     create-token \
     --decimals 2 \
     --transfer-fee-basis-points 100 \
     --transfer-fee-maximum-fee 500 \
     --interest-rate 5 \
     --enable-metadata
   ```

   This single command does several things at once:

   - `--decimals 2` sets the token to two decimal places, like dollars and cents
   - `--transfer-fee-basis-points 100` configures a 1% fee on every transfer (100 basis points = 1%)
   - `--transfer-fee-maximum-fee 500` caps the fee at 5 tokens (500 in raw units with 2 decimals)
   - `--interest-rate 5` attaches a 5% continuous compounding interest rate
   - `--enable-metadata` reserves space for on-chain metadata

   The mint address from the output gets used in every step that follows.

2. **Add metadata to the mint.** The `--enable-metadata` flag reserved space for metadata, but did not fill it in. Now initialize the token's name, symbol, and metadata URI.

   **Run it:**

   ```bash
   spl-token initialize-metadata \
     [MINT_ADDRESS] \
     "ArcCoin" \
     "ARC" \
     "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json"
   ```

   That URI points to a sample metadata JSON file hosted on GitHub. In a production token, a self-hosted JSON file with a name, symbol, description, and image URL would replace it. For today, the sample file works.

3. **Inspect the mint.** Before minting any tokens, verify that all three extensions are active on the mint account.

   **Run it:**

   ```bash
   spl-token display [MINT_ADDRESS]
   ```

   The output should show sections for each extension:

   - A Transfer fee section showing the basis points and maximum fee
   - An Interest-bearing section showing the rate
   - A Metadata pointer and Metadata section showing the name, symbol, and URI

   All three are stored in the same mint account. The Token Extensions Program allocated enough space for every TLV (type-length-value) entry when the mint was created.

4. **Create a token account and mint tokens.** Create a token account for my wallet, then mint 1,000 tokens to it.

   **Run it:**

   ```bash
   spl-token create-account [MINT_ADDRESS]
   ```

   ```bash
   spl-token mint [MINT_ADDRESS] 1000
   ```

5. **Create a second wallet and transfer tokens.** To see the transfer fee in action, a second wallet is needed. Generate a new keypair, create a token account for it, and send some tokens.

   **Run it:**

   ```bash
   solana-keygen new --outfile ~/second-wallet.json --no-bip39-passphrase --force
   ```

   ```bash
   spl-token create-account [MINT_ADDRESS] --owner ~/second-wallet.json --fee-payer ~/.config/solana/id.json
   spl-token transfer [MINT_ADDRESS] 100 ~/second-wallet.json --expected-fee 1 --allow-unfunded-recipient
   ```

   The `--expected-fee` flag tells the CLI to expect a 1% fee on the transfer. Out of the 100 tokens sent, 1 token is withheld as a fee and deposited into the recipient's token account in a special withheld balance. The recipient receives 99 tokens in their available balance.

6. **Check the balances.** Verify the transfer worked and the fee was collected.

   **Run it:**

   ```bash
   spl-token balance [MINT_ADDRESS]
   ```

   ```bash
   spl-token balance [MINT_ADDRESS] --owner ~/second-wallet.json
   ```

   My original wallet should show 900 tokens. The second wallet should show 99 tokens (100 minus the 1-token fee).

7. **Observe the interest-adjusted display amount.** The interest-bearing extension does not change the raw balance on-chain. Instead, it provides a formula that wallets and applications use to display an adjusted amount based on elapsed time.

   **Run it:**

   ```bash
   spl-token display [MINT_ADDRESS]
   ```

   The interest rate is applied using continuous compounding. Because only seconds or minutes had passed since the tokens were minted, the UI amount adjustment was very small. Over longer periods, the difference between the raw amount and the displayed amount grows. The key insight is that the interest calculation and the transfer fee operate completely independently: one adjusts how amounts are displayed, and the other deducts tokens during transfers.

8. **Harvest the withheld fees.** Transfer fees accumulate in a withheld balance on recipient token accounts. As the mint authority, those fees can be harvested. First, find the second wallet's token account address, then withdraw the withheld fees.

   **Run it:**

   ```bash
   spl-token accounts --owner ~/second-wallet.json -v
   ```

   ```bash
   spl-token withdraw-withheld-tokens [YOUR_TOKEN_ACCOUNT] [SECOND_WALLET_TOKEN_ACCOUNT]
   ```

   `[YOUR_TOKEN_ACCOUNT]` is my own token account address and `[SECOND_WALLET_TOKEN_ACCOUNT]` is the token account address from the previous command's output. The withheld fee is transferred to my token account.
