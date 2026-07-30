# Day 51: Transferring a Fee-Bearing Token and Withdrawing Withheld Fees

## What I needed

- A terminal with the Solana CLI installed and configured for devnet
- The spl-token CLI (installed with `cargo install spl-token-cli`)
- The mint address from yesterday's fee-bearing token
- My default wallet keypair, already funded with devnet SOL
- A code editor or notes app to keep track of the addresses generated

## Steps

1. Confirm I am still on devnet and the CLI can see my wallet:
   ```bash
   solana config set --url https://api.devnet.solana.com
   solana address
   solana balance
   ```
   If the balance is low, top up with `solana airdrop 2`.

   Note: the devnet airdrop can sometimes fail due to rate limiting. If this happens, use the web faucet instead.

2. Export the mint address from yesterday into a shell variable so the next commands stay readable:
   ```bash
   export MINT=[PASTE_YOUR_MINT_ADDRESS_HERE]
   ```
3. Mint a fresh batch of supply to my own wallet so there's something to send. The number is a UI amount, so this mints one million whole tokens:
   ```bash
   spl-token mint $MINT 1000000
   ```
4. Generate a brand new keypair to act as the recipient. This wallet is throwaway and lives only on my machine:
   ```bash
   solana-keygen new --no-bip39-passphrase --outfile recipient.json
   export RECIPIENT=$(solana address -k recipient.json)
   echo "Recipient wallet: $RECIPIENT"
   ```
5. Create the recipient's associated token account for this mint up front. The recipient's throwaway wallet has no SOL, so I pay the rent myself with `--fee-payer`. Creating the account explicitly means I can see exactly which address holds the tokens before any transfer happens:
   ```bash
   spl-token create-account $MINT \
     --owner $RECIPIENT \
     --fee-payer ~/.config/solana/id.json
   ```
6. Transfer 1000 tokens to the recipient. The `--expected-fee` flag tells the runtime exactly how much fee I expect to be withheld and aborts the transfer if the math does not match. Yesterday's mint charges 100 basis points (1 percent), so the fee on 1000 tokens is 10 tokens. If I used different basis points, recalculate the fee as `amount * basisPoints / 10000`. There is no `--fund-recipient` flag here on purpose: the CLI cannot create an account on the fly for a mint that charges a transfer fee, which is exactly why the recipient's account was created explicitly in the previous step. The recipient wallet holds no SOL, so `--allow-unfunded-recipient` lets the transfer proceed to the account already created:
   ```bash
   spl-token transfer \
     --expected-fee 10 \
     $MINT 1000 $RECIPIENT \
     --allow-unfunded-recipient
   ```
7. Find the recipient's token account address to inspect it:
   ```bash
   spl-token accounts --owner $RECIPIENT --verbose
   ```
   Copy the token account address from the output and save it:
   ```bash
   export RECIPIENT_TA=[PASTE_RECIPIENT_TOKEN_ACCOUNT_HERE]
   ```
8. Read the recipient's token account directly on chain. Look for the `TransferFeeAmount` extension and the `withheld_amount` field. That is the slice the protocol kept for me, sitting on the recipient's account, untouchable by the recipient:
   ```bash
   spl-token display $RECIPIENT_TA
   ```
9. Find my own associated token account for this mint so I have somewhere to withdraw the fees back into. Scoping to `$MINT` keeps the output to just this token instead of every account my default wallet owns:
   ```bash
   spl-token accounts $MINT --verbose
   ```
   Save my token account address:
   ```bash
   export MY_TA=[PASTE_YOUR_TOKEN_ACCOUNT_HERE]
   ```
10. Withdraw the withheld fees from the recipient's account into my own token account. This call uses the withdraw authority set yesterday, which by default is my wallet:
    ```bash
    spl-token withdraw-withheld-tokens $MY_TA $RECIPIENT_TA
    ```
11. Confirm the loop closed. The recipient's withheld amount should now be zero, and my own balance should reflect the 10 tokens just reclaimed:
    ```bash
    spl-token display $RECIPIENT_TA
    spl-token balance $MINT
    ```

## Run it

```bash
spl-token create-account $MINT --owner $RECIPIENT --fee-payer ~/.config/solana/id.json
spl-token transfer --expected-fee 10 $MINT 1000 $RECIPIENT --allow-unfunded-recipient
spl-token display $RECIPIENT_TA
spl-token withdraw-withheld-tokens $MY_TA $RECIPIENT_TA
```

## Terminal session

```text
recipient: H8mnr246sk3aFnmJTnqCjfEyV828V5kb4uza8RgXFmFj
mint: 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
Program                                       Token                                         Account                                       Delegated  Close Authority  Balance
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb   2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf  9aHSPFo69CoRevGtz9Y4FjcxVnCxEuxtKLyzuwM7w1yi                              990

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token accounts $MINT --verbose
Program                                       Account                                       Delegated  Close Authority  Balance
-------------------------------------------------------------------------------------------------------------------------------
TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb   HyvqtYjqb2qJosWSyhuvktiLRtyjXyBKR2fE4Y1uTMUw                              1000000

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana config set --url https://api.devnet.solana.com
solana address
solana balance
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json
Commitment: confirmed
DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
13.82810312 SOL
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ export MINT=2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint $MINT 1000000
Minting 1000000 tokens
  Token: 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
  Recipient: HyvqtYjqb2qJosWSyhuvktiLRtyjXyBKR2fE4Y1uTMUw

Signature: 4UBMsuR9LZNA9hseG8px9npTF6Xq63KKr2H3Ay8FrmcBN6SEYCMAg6v1m7MMFDzLJfp9NsPEXnBMBr7s5Z3Q9KxP

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana-keygen new --no-bip39-passphrase --outfile recipient.json
export RECIPIENT=$(solana address -k recipient.json)
echo "Recipient wallet: $RECIPIENT"
Generating a new keypair
Wrote new keypair to recipient.json
======================================================================
pubkey: H8mnr246sk3aFnmJTnqCjfEyV828V5kb4uza8RgXFmFj
======================================================================
Save this seed phrase to recover your new keypair:
nurse veteran video decide film dress rose trap cost dish impact hurry
======================================================================
Recipient wallet: H8mnr246sk3aFnmJTnqCjfEyV828V5kb4uza8RgXFmFj
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account $MINT \
  --owner $RECIPIENT \
  --fee-payer ~/.config/solana/id.json
Creating account 9aHSPFo69CoRevGtz9Y4FjcxVnCxEuxtKLyzuwM7w1yi

Signature: 3GEUfb52X9Mzd5gbKpJnwRksH37mudiorVAeDUiztdEC7rjPzydvGfpTXsfkJNt4mgMXdwX4rg4fD8DRVRzdxR6G

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token transfer \
  --expected-fee 10 \
  $MINT 1000 $RECIPIENT \
  --allow-unfunded-recipient
Transfer 1000 tokens
  Sender: HyvqtYjqb2qJosWSyhuvktiLRtyjXyBKR2fE4Y1uTMUw
  Recipient: H8mnr246sk3aFnmJTnqCjfEyV828V5kb4uza8RgXFmFj
  Recipient associated token account: 9aHSPFo69CoRevGtz9Y4FjcxVnCxEuxtKLyzuwM7w1yi

Signature: 5tzXPzkSHATEHyCo2LzHyJj6v4oLqbuxU2JSpqJnmTFA1sTRwZ6iHNKbZWc9za6NfW8FDbvgs1z66kC6iN22cYWy

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token accounts --owner $RECIPIENT --verbose
Program                                       Token                                         Account                                       Delegated  Close Authority  Balance
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb   2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf  9aHSPFo69CoRevGtz9Y4FjcxVnCxEuxtKLyzuwM7w1yi                              990

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ export RECIPIENT_TA=9aHSPFo69CoRevGtz9Y4FjcxVnCxEuxtKLyzuwM7w1yi
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display $RECIPIENT_TA

SPL Token Account
  Address: 9aHSPFo69CoRevGtz9Y4FjcxVnCxEuxtKLyzuwM7w1yi
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Balance: 990
  Decimals: 6
  Mint: 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
  Owner: H8mnr246sk3aFnmJTnqCjfEyV828V5kb4uza8RgXFmFj
  State: Initialized
  Delegation: (not set)
  Close authority: (not set)
Extensions:
  Immutable owner
  Transfer fees withheld: 10000000

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token accounts $MINT --verbose
Program                                       Account                                       Delegated  Close Authority  Balance
-------------------------------------------------------------------------------------------------------------------------------
TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb   HyvqtYjqb2qJosWSyhuvktiLRtyjXyBKR2fE4Y1uTMUw                              1000000

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ export MY_TA= HyvqtYjqb2qJosWSyhuvktiLRtyjXyBKR2fE4Y1uTMUw
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token withdraw-withheld-tokens $MY_TA $RECIPIENT_TA
error: The following required arguments were not provided:
    <SOURCE_ADDRESS|--include-mint>

USAGE:
    spl-token withdraw-withheld-tokens <FEE_RECIPIENT_ADDRESS> <SOURCE_ADDRESS|--include-mint>

For more information try --help
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ export MY_TA=HyvqtYjqb2qJosWSyhuvktiLRtyjXyBKR2fE4Y1uTMUw
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token withdraw-withheld-tokens $MY_TA $RECIPIENT_TA

Signature: 51tkerCArB3LXFTouQugWU3XefTmnrNqoQFHCVfZsqgsyiSapUNjRwaXNBJfQbp9yxrz2QtnWTrho7jzsVyYBp5A

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display $RECIPIENT_TA
spl-token balance $MINT

SPL Token Account
  Address: 9aHSPFo69CoRevGtz9Y4FjcxVnCxEuxtKLyzuwM7w1yi
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Balance: 990
  Decimals: 6
  Mint: 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
  Owner: H8mnr246sk3aFnmJTnqCjfEyV828V5kb4uza8RgXFmFj
  State: Initialized
  Delegation: (not set)
  Close authority: (not set)
Extensions:
  Immutable owner
  Transfer fees withheld: 0

1000010
```

Note: I initially set `$MY_TA` with a stray leading space (`export MY_TA= HyvqtYjqb2qJosWSyhuvktiLRtyjXyBKR2fE4Y1uTMUw`), which the shell parsed as setting `MY_TA` to empty and running the address as a separate command; that produced the "required arguments were not provided" error since `$MY_TA` expanded to nothing. Re-exporting without the space fixed it and the withdraw succeeded, dropping the recipient's withheld amount to 0 and bringing my own balance to 1000010.
