# Day 44: A Token-2022 NFT With On-Chain Metadata

Mint address: `nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1`

Metadata URI: `https://gist.githubusercontent.com/tanishaf28/f289de34f9a628bfe64d3db2972646f3/raw/88dc687242ee1c21e119d639f608996f6051ce47/metadata.json`

## The Challenge

Create a fresh Token-2022 mint with the metadata extension enabled, host a small JSON file describing the NFT, write the on-chain metadata pointing to that JSON, mint exactly one unit to my wallet, and lock everything down. By the end I'd have a complete, viewable, non-fungible artifact on devnet.

## What I needed

- The spl-token CLI (installed via Solana CLI tools, recent enough to support Token-2022 metadata commands)
- A devnet keypair already funded with at least 0.5 SOL (`solana airdrop 1` if needed)
- A free GitHub Gist account to host the JSON metadata file
- A public URL for an image (any direct PNG or JPG link works; a Wikipedia Commons URL or a GitHub-raw URL is fine)
- A terminal and a code editor

## Steps

1. Confirm the CLI is pointed at devnet and check the balance:
   ```bash
   solana config set --url https://api.devnet.solana.com
   solana balance
   ```
2. Pick or upload an image. The simplest option is to find any PNG already hosted on the open web and copy its direct URL. A placeholder is fine for the first pass; it can be swapped later. Keep the URL handy.
3. Create the off-chain metadata JSON. Open a new GitHub Gist, name the file `metadata.json`, and paste in the following, replacing the values to describe my own NFT:
   ```json
   {
     "name": "First Light",
     "symbol": "LIGHT",
     "description": "My first real NFT, minted on Solana devnet during 100 Days of Solana.",
     "image": "https://upload.wikimedia.org/wikipedia/commons/4/49/Dichroic_filters.jpg",
     "attributes": [
       { "trait_type": "Filters", "value": "44" },
       { "trait_type": "Network", "value": "Devnet" }
     ]
   }
   ```
4. Save the gist as public, then click the Raw button. Copy that raw URL. It should start with `https://gist.githubusercontent.com/` and end in `metadata.json`. This is the metadata URI.
5. Generate a vanity-friendly mint keypair so the mint address is easy to read:
   ```bash
   solana-keygen grind --starts-with nft:1
   ```
   This produces a JSON file in the current directory like `nftXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.json`. Note the mint address (the file name without `.json`).
6. Create the mint with the metadata extension turned on. The Token Extensions program ID is `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`:
   ```bash
   spl-token create-token \
     --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
     --enable-metadata \
     --decimals 0 \
     ./nftXXXX...XXXX.json
   ```
   Replace the path with the actual file produced in step 5. The `--enable-metadata` flag wires up both the metadata pointer (pointing the mint at itself) and reserves space for metadata fields on the mint account.
7. Initialize the on-chain metadata fields. The arguments are `mint name symbol uri`:
   ```bash
   spl-token initialize-metadata \
     [YOUR_MINT_ADDRESS] \
     "First Light" \
     "LIGHT" \
     [YOUR_GIST_RAW_URL]
   ```
   Substitute the actual mint address and the raw gist URL from step 4. After this transaction confirms, the mint account itself stores the name, symbol, and URI.
8. Create the associated token account and mint exactly one unit:
   ```bash
   spl-token create-account [YOUR_MINT_ADDRESS]
   spl-token mint [YOUR_MINT_ADDRESS] 1
   ```
9. Lock the supply forever by disabling the mint authority, the same move from Day 43:
   ```bash
   spl-token authorize [YOUR_MINT_ADDRESS] mint --disable
   ```
10. Open Solana Explorer (devnet), paste the mint address into the search bar, and look at the token page. I should see the name, symbol, the image rendered from the JSON, and the attributes listed.

## Run it

```bash
spl-token display [YOUR_MINT_ADDRESS]
```

I should see fields like `Mint`, `Supply: 1`, `Decimals: 0`, `Mint authority: (not set)`, plus a metadata block listing the name, symbol, and URI.

```text
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana config set --url https://api.devnet.solana.com
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json
Commitment: confirmed
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana balance
13.859256 SOL
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana-keygen grind --starts-with nft:1
Searching with 20 threads for:
        1 pubkey that starts with 'nft' and ends with ''
Wrote keypair to nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1.json
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-token \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --enable-metadata \
  --decimals 0 \
  ./nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1.json
Creating token nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize metadata inside the mint, please run `spl-token initialize-metadata nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.

Address:  nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1
Decimals:  0

Signature: 2Qft3sknLtzmmESaPriPEnSiYUn8xJutUS7uapx8DqcB3wvGbWmScsB91cXW3iVoEa2az3H7hRSjYd4aasDTzYHA

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token initialize-metadata \
  nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 \
  "First Light" \
  "LIGHT" \
  https://gist.githubusercontent.com/tanishaf28/f289de34f9a628bfe64d3db2972646f3/raw/88dc687242ee1c21e119d639f608996f6051ce47/metadata.json

Signature: KWtJGzBL1389vUDoUnXcwAc7iiYvZUXMXVBrwoVz7HVKqPBZ3tmUUAxaajNzQVnciZiGwaTnsZJrZqBxikuHiT8

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1
Creating account 3CSxMezSwQQrj3HXzrzJzv3XqTQjcqKdEc9h6RPskBhX

Signature: 5cKqPiEo4LAMevGaQGP2XUrLKsR6BpA2xcWetVm2rFMM8hxZLdCdGQELmtW84qn71GtmDVKJi8xaNLxbrSX9ujXy

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint 3CSxMezSwQQrj3HXzrzJzv3XqTQjcqKdEc9h6RPskBhX 1
Error: "Could not find mint account 3CSxMezSwQQrj3HXzrzJzv3XqTQjcqKdEc9h6RPskBhX"
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 1
Minting 1 tokens
  Token: nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1
  Recipient: 3CSxMezSwQQrj3HXzrzJzv3XqTQjcqKdEc9h6RPskBhX

Signature: 3nrjPRXTgsoQmpnwsuXMZ3xgkeroZZvw3LSFtuDdBGPkc7J2jv26P7a2Jf7cs5AqUoAWCiA3wmKQMVARjE2MPAYq

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token authorize nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 mint --disable
Updating nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1
  Current mint: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  New mint: disabled

Signature: 42BFZ9UeGMaS2hjU7wL5EkC1pNspPWw5QDiHKZXE8GLBPPfDeCnveQ8GSHGTeJJFjMK6w7Yd9jtghA8EAtHTXYzs

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1

SPL Token Mint
  Address: nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 1
  Decimals: 0
  Mint authority: (not set)
  Freeze authority: (not set)
Extensions
  Metadata Pointer:
    Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Metadata address: nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1
  Metadata:
    Update Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Mint: nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1
    Name: First Light
    Symbol: LIGHT
    URI: https://gist.githubusercontent.com/tanishaf28/f289de34f9a628bfe64d3db2972646f3/raw/88dc687242ee1c21e119d639f608996f6051ce47/metadata.json
```

Note: an early attempt to mint against the associated token account address (`3CSxMezSwQQrj3HXzrzJzv3XqTQjcqKdEc9h6RPskBhX`) failed with `Could not find mint account`, because `spl-token mint` takes the mint address, not the token account address. Minting against the correct mint address worked.
