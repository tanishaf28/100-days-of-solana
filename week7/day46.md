# Day 46: Verifying the Member NFT Against the Collection

## Steps

1. Confirm the devnet setup. Make sure the CLI is talking to devnet so any commands against my mints resolve correctly.
   ```bash
   solana config set --url https://api.devnet.solana.com
   solana config get
   ```
2. Display the member NFT. Use `spl-token display` on the mint address of the NFT built on Day 44 (replace `YOUR_NFT_MINT` with that address).
   ```bash
   spl-token display YOUR_NFT_MINT
   ```
   I should see:
   - `Supply: 1`
   - `Decimals: 0`
   - `Mint authority: (not set)` because it was burned on Day 43
   - An Extensions section listing MetadataPointer, TokenMetadata, and GroupMemberPointer (plus TokenGroupMember if member data was stored on the mint itself)
   - The Name, Symbol, and URI set on Day 44
3. Display the collection NFT. Run the same command against the collection mint from Day 45.
   ```bash
   spl-token display YOUR_COLLECTION_MINT
   ```
   This time I should see GroupPointer and TokenGroup in the extensions list, along with a max size and an update authority for the group.
4. Verify the parent reference. Inside the TokenGroupMember data on the member NFT, find the Group address. It should equal the collection mint address byte-for-byte. This is the equivalent of a foreign key resolving correctly between two rows.
5. View both on Solana Explorer. Open Solana Explorer, make sure the cluster dropdown shows Devnet, and paste in the member mint address. Click around the page and find:
   - The Token Extensions panel listing every extension on the mint
   - The Metadata section rendering the token's name and image
   - A link or address pointing back to the collection mint

   Repeat for the collection mint address.
6. Compare with an old fungible mint. If I still have any mint address from the SPL Token weeks, run `spl-token display` on it too. Notice what is missing: no Extensions block with metadata, no group pointer, decimals greater than zero, supply larger than one. This contrast is the clearest way to see what makes an NFT an NFT on Solana.

## Run it

```bash
solana config set --url https://api.devnet.solana.com
spl-token display YOUR_NFT_MINT
spl-token display YOUR_COLLECTION_MINT
```

```text
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana config set --url https://api.devnet.solana.com
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json
Commitment: confirmed
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana config get
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json
Commitment: confirmed
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

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display zP92TyP2k8vPeXhgZ2sPfdaBYVpSC6GVHEzV7ck1chx

SPL Token Mint
  Address: zP92TyP2k8vPeXhgZ2sPfdaBYVpSC6GVHEzV7ck1chx
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 0
  Decimals: 0
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Metadata Pointer:
    Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Metadata address: zP92TyP2k8vPeXhgZ2sPfdaBYVpSC6GVHEzV7ck1chx
  Group Pointer:
    Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Group address: zP92TyP2k8vPeXhgZ2sPfdaBYVpSC6GVHEzV7ck1chx
  Metadata:
    Update Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Mint: zP92TyP2k8vPeXhgZ2sPfdaBYVpSC6GVHEzV7ck1chx
    Name: Solana Sketchbook
    Symbol: S
    URI: https://gist.githubusercontent.com/janvinsha/b477ebe4dda46b0ef03895c4ea930a46/raw/f29222bcaff0d4979fe7ebb610a00bb97a8418ec/collection.json
  Token Group:
    Update Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Mint: zP92TyP2k8vPeXhgZ2sPfdaBYVpSC6GVHEzV7ck1chx
    Size: 2
    Max Size: 3
```

Note: the collection mint's `Supply` reads `0` here even though it is a real collection mint. That is expected: the collection mint itself is never minted a unit, only the member mints are.
