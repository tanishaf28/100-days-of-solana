# Day 43: Minting a Zero-Decimal NFT and Locking the Mint Authority

## Steps

1. Confirm the CLI is pointed at devnet and that I have some SOL to pay rent and fees. If anything looks off, airdrop a little more SOL before continuing.
2. Create a new token mint with zero decimals. Zero decimals means the token has no fractional units, which is the first half of "non-fungible." Save the mint address the command prints; it's needed in every step that follows.
3. Create an associated token account for that mint under my wallet. This is the box that will hold the single token.
4. Mint exactly one token into that account. After this command runs, the total supply of this mint on the entire Solana network is one.
5. Disable the mint authority. This is the second half of "non-fungible." With no mint authority, nobody, not even me, can ever create a second copy. The supply is locked at one for all time.
6. Open Solana Explorer, paste in the mint address, and look at how the page describes it. Take a screenshot of the Explorer page showing the new NFT.

## Run it

Mint address: `w43CqzHwGSxVNUxWPH9NnP7mx74bVJk3cxsDY9tbXm5`

```bash
solana config set --url https://api.devnet.solana.com
```

```text
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json
Commitment: confirmed
```

```bash
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana balance
13.86278188 SOL

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-token --decimals 0
Creating token w43CqzHwGSxVNUxWPH9NnP7mx74bVJk3cxsDY9tbXm5 under program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

Address:  w43CqzHwGSxVNUxWPH9NnP7mx74bVJk3cxsDY9tbXm5
Decimals:  0

Signature: 2Vs5M7m3psuVEd4pbDRp9X1e5Z2BmjtQB7xgtk6Zru1eNRYawD518RStwdcRNbgN4vTg81daUo2641FW5knTBRWD

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account w43CqzHwGSxVNUxWPH9NnP7mx74bVJk3cxsDY9tbXm5
Creating account 5KBSngZ1p8R9ppX9mvitw5v66j1HG5nVpGFrnbCbLGYH

Signature: 2EJSsLakgdtAuanbxw6aehHRsey42nUbZtQm2ifPXiFAn5bdXbdC9icrihwHinnPAVpJy4dxS7rhRQrYWim4eFDT

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint w43CqzHwGSxVNUxWPH9NnP7mx74bVJk3cxsDY9tbXm5 1
Minting 1 tokens
  Token: w43CqzHwGSxVNUxWPH9NnP7mx74bVJk3cxsDY9tbXm5
  Recipient: 5KBSngZ1p8R9ppX9mvitw5v66j1HG5nVpGFrnbCbLGYH

Signature: U6ERF9i1fCYKjbojj5S4dfUJYrXsX3numWaNy4rYxcg8TJB8FGXKRYsweZan2bJ4iCx5i34n29AC55auDGcCBFp

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token authorize w43CqzHwGSxVNUxWPH9NnP7mx74bVJk3cxsDY9tbXm5 mint --disable
Updating w43CqzHwGSxVNUxWPH9NnP7mx74bVJk3cxsDY9tbXm5
  Current mint: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  New mint: disabled

Signature: QyawxK4fAbyLdHz1nJs3vpd8h65BoicMQ9C48ht5e8wp27nRroerBRuuboi7ryYs8pDdmVv4xS65AmjgKFLyJTG

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token supply w43CqzHwGSxVNUxWPH9NnP7mx74bVJk3cxsDY9tbXm5
1
```
