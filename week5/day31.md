# Day 31: Explore Advanced Token Incentive Design

## Terminal Session

```text
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --transfer-fee-basis-points 100 --transfer-fee-maximum-fee 5000
Creating token BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs
Decimals:  9

Signature: miyMy1A8DmdWsnhoUWUtTWocMyJUNH8nnLmGqpDZvGvtaUtD2EnPALDMtX7arsZ2azmh49BR9F78MjPeUvdBYa5

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs
Creating account CftRHxRFNNwKS5LbTZ6L6sqVtQ57LbmfDqEuKHzmWLxs

Signature: 3Xwdx4cxuQ9XgYDRm2PcVk6ZLLnywDvLw9en37Mosg1zndpDZZEWWZffonnnwmBEbGdzZuQY5TtvWN78DNpKi5rw

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint  BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs 1000
Minting 1000 tokens
  Token: BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs
  Recipient: CftRHxRFNNwKS5LbTZ6L6sqVtQ57LbmfDqEuKHzmWLxs

Signature: 4ebqfFpnfasKtL1fa79SqdR85iM2NNpQamMSZKDvXB8GHqwwGGuuzZGd1FaXJHwpM6fDqYrMwaQWaczDgLeyptH7

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs --owner 3cqdhj5w9Qjp62aeEc6bqRmkPWGWroEXrWwxuWmtbLud --fee-payer ~/.config/solana/id.json
Creating account 4x3o6cotxU4fqrPtetdTmKgGkMK86pb4FfZm93i1TUJt

Signature: 2gG82ejuCc643q3GDAxreWXy6orxnqdAWEt24PzsXzvSvEzDdH6edXvRtYkLZAQfZQBF1xUAvXi74F5PkRu7yTZ3

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token transfer BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs 100 4x3o6cotxU4fqrPtetdTmKgGkMK86pb4FfZm93i1TUJt --expected-fee 1
Transfer 100 tokens
  Sender: CftRHxRFNNwKS5LbTZ6L6sqVtQ57LbmfDqEuKHzmWLxs
  Recipient: 4x3o6cotxU4fqrPtetdTmKgGkMK86pb4FfZm93i1TUJt

Signature: 42bAHC739s24Lc3MPf2iGPbryXtG2D2SsfUvMgH8h9mU29QEDqFjAg6WeHXKeUaQsbtMuLPkkzv538sHSixBqEDx

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token balance BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs
900

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token balance BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs --owner 4x3o6cotxU4fqrPtetdTmKgGkMK86pb4FfZm93i1TUJt
Error: "Could not find token account 9zdv3uNEwXx8hv4gmvVcRC5mii9HmMuJ4XUTkrzpyLnJ"
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token accounts --owner 3cqdhj5w9Qjp62aeEc6bqRmkPWGWroEXrWwxuWmtbLud
Token                                         Balance
-----------------------------------------------------
BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs  99

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token accounts BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs
Balance
-------
900
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token withdraw-withheld-tokens \
BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs \
CftRHxRFNNwKS5LbTZ6L6sqVtQ57LbmfDqEuKHzmWLxs
Error: "Could not deserialize token account BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs"
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token withdraw-withheld-tokens \
CftRHxRFNNwKS5LbTZ6L6sqVtQ57LbmfDqEuKHzmWLxs \
4x3o6cotxU4fqrPtetdTmKgGkMK86pb4FfZm93i1TUJt

Signature: 2L8Q7pQfpcPcViCFd46yijHWXRehpmANJUWghfpeywT3HfQ2zXGyPD392PCCgpS5yJn4LveHfk66pZuJW24S8AVc

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token balance BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs
901
```

## Scenario

Yesterday, I built a fully branded token on Solana: a name, a symbol, metadata, a minted supply, and a transfer to another wallet. If this were a Web2 platform, that would be launching an internal currency. Users can hold it, send it, and see what it is. That is a solid foundation.

But think about the platforms most people have used or built in Web2. Almost none of them let value move around for free. Payment processors take a cut of every transaction. Marketplace platforms charge seller fees. Subscription services skim a percentage when creators get paid. These fees are not just revenue; they are how platforms sustain themselves, fund development, and align incentives.

On Solana, you do not need a backend service sitting between users to collect fees on every transfer. The Token-2022 Program, using Solana's Token Extensions, includes a transfer fee extension that enforces fee collection at the program level. When a token moves from one wallet to another, a percentage of the transfer is automatically withheld in the recipient's token account, and only the configured withdraw withheld authority can collect it. Any valid transfer of this mint has to respect the fee configuration. Today, I created a token with a built-in transfer fee, moved some tokens around, and then collected the fees that were withheld.

## Challenge

### What I'll Need

- Solana CLI tools installed and configured to devnet
- A funded devnet wallet (use `solana airdrop 2` if SOL is needed)
- A second keypair file for testing transfers (created in a previous challenge, or generate a new one)
- A terminal

## Steps

1. **Create a token with a transfer fee.** I have created tokens before, but this time I added the transfer fee extension at creation time. Extensions must be configured when the mint is first created; they cannot be added later. The `--program-id` below points at the Token-2022 Program, which is required for any token using extensions. This creates a new token with a 1% transfer fee (100 basis points) and a maximum fee of 5,000 base units:

   ```bash
   spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --transfer-fee-basis-points 100 --transfer-fee-maximum-fee 5000
   ```

   A basis point is 1/100th of a percent, so 100 basis points equals 1%. The maximum fee caps how much can be withheld on a single transfer, regardless of the transfer amount.

   Note that `--transfer-fee-maximum-fee 5000` is expressed in base units, not whole displayed tokens. The displayed amount depends on the mint's decimals: with the spl-token CLI default of 9 decimals, 5,000 base units is a very small fraction of one displayed token. To make the cap equal to 5,000 displayed tokens, `--decimals 0` would also need to be set (or the value scaled to match the chosen decimals).

   The mint address from the output gets saved for the remaining steps.

2. **Create a token account and mint some supply.** This works just like it did yesterday: create a token account for my wallet, then mint tokens into it.

   ```bash
   spl-token create-account [MINT_ADDRESS]
   spl-token mint [MINT_ADDRESS] 1000
   ```

   That gives 1,000 tokens in my wallet's token account.

3. **Create a token account for the second wallet.** A destination is needed for the transfer. Create the associated token account for the second wallet's owner address, signed and paid for from the main wallet:

   ```bash
   spl-token create-account [MINT_ADDRESS] --owner [SECOND_WALLET_OWNER_ADDRESS] --fee-payer ~/.config/solana/id.json
   ```

   `[SECOND_WALLET_OWNER_ADDRESS]` is the public key of the second keypair (the wallet address), not a token account address. The token account address that this command prints gets reused in Step 6.

4. **Transfer tokens and watch the fee get withheld.** When transferring tokens that have a transfer fee, the `--expected-fee` flag must be included. This is a safety measure: the transfer will only succeed if the fee specified matches the fee the program calculates. For a transfer of 100 tokens at 1%, the expected fee is 1 token. Pass the second wallet's owner address as the recipient and let the CLI resolve to the associated token account just created:

   ```bash
   spl-token transfer [MINT_ADDRESS] 100 [SECOND_WALLET_OWNER_ADDRESS] --expected-fee 1
   ```

   Because the destination account already exists, `--allow-unfunded-recipient` is not needed here.

5. **Check the balances.** Check the balance of both wallets:

   ```bash
   spl-token balance [MINT_ADDRESS]
   spl-token balance [MINT_ADDRESS] --owner [SECOND_WALLET_OWNER_ADDRESS]
   ```

   My wallet should show 900 tokens (100 were sent). The second wallet should show 99 tokens, not 100. The missing token was withheld. It sits in the second wallet's token account, but the second wallet cannot touch it. Only the withdraw withheld authority, which by default is the wallet that created the mint, can collect it.

6. **Withdraw the withheld fees.** Because my wallet is the withdraw withheld authority (set when the mint was created), I can sweep withheld fees out of any token account on this mint and into a destination token account I control. First, list my own token accounts to find the one holding my 900 tokens:

   ```bash
   spl-token accounts [MINT_ADDRESS]
   ```

   The `withdraw-withheld-tokens` subcommand takes the destination token account first, followed by one or more source token accounts to pull fees from. My own token account is the destination and the second wallet's token account (from Step 3) is the source:

   ```bash
   spl-token withdraw-withheld-tokens [YOUR_TOKEN_ACCOUNT_ADDRESS] [SECOND_WALLET_TOKEN_ACCOUNT_ADDRESS]
   ```

   This pulls the withheld fees from the second wallet's token account into my token account. Checking the balance again confirms it:

   ```bash
   spl-token balance [MINT_ADDRESS]
   ```

   The result should be 901 tokens: the original 900 plus the 1 token that was withheld as a fee.

## What Just Happened

I created a token where the transfer fee is enforced by the Token-2022 Program itself. The fee logic lives in the mint's transfer fee extension, so any valid transfer of this mint goes through the same fee calculation. There is no application-level fee handler to bypass: the program rejects transfers whose `--expected-fee` does not match the configured fee.

In Web2, charging a per-transaction fee usually means building middleware, hooking into payment flows, and handling edge cases around refunds and rounding. Here, the fee parameters get set at mint creation and the program handles withholding on every transfer. The withheld tokens accumulate in the recipient accounts that received them, and the withdraw withheld authority can sweep them out on its own schedule. Because the state is on-chain, anyone can verify what was withheld and when.

This pattern shows up across a range of use cases on Solana: marketplace fees, protocol treasuries, creator-style fee flows, and operational cost recovery. It only took a handful of CLI commands.
