# Day 47: Live-Mutating NFT Metadata On Chain

NFT mint: `nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1`

## Steps

1. Make sure the Solana CLI is pointed at devnet by running `solana config set --url https://api.devnet.solana.com`. Confirm with `solana config get`.
2. Open the NFT in Solana Explorer. Paste the mint address into the search bar and scroll down to the Token Extensions panel. Find the Token Metadata extension. Note the current name, symbol, URI, and any additional metadata fields. Keep this tab open to come back to after every change.
3. Pick a new name for the NFT ("Field Notes", "Devnet Original", "Probably Worthless", anything). Run the rename command shown in the Run it section below, substituting the mint address.
4. Refresh the Explorer tab. The name field should reflect the change within a few seconds. If it does not, give it a beat, since devnet RPC nodes occasionally lag a slot or two behind.
5. Invent a custom field. The metadata extension lets me store arbitrary key/value pairs in the `additional_metadata` array. Add one called `rarity` with the value `legendary`. Or `vibe`, `chaotic-good`. Or `edition`, `field-test-1`. The point is the schema is open.
6. Refresh Explorer again. Scroll down to the Token Metadata extension and look for the new key under additional metadata. There it is, on chain, on a public network, queryable by anyone with an RPC endpoint.
7. Change my mind. Remove the custom field just added by passing the `--remove` flag. Refresh Explorer. Watch it disappear.
8. Finally, swap the image. Find any publicly hosted image I have rights to use, get its raw URL, build a new metadata JSON file that points at it, host the JSON somewhere public (a GitHub gist with the raw URL works), and update the `uri` field on the mint to point at the new JSON.
9. Open a wallet like Phantom or Backpack on devnet and import or send the NFT to a wallet I control. See whether the new image shows up. Wallets cache aggressively, so this is also a lesson in how the off-chain image layer behaves differently from the on-chain metadata layer.

## Run it

Update the name field:
```bash
spl-token update-metadata [MINT_ADDRESS] name "Field Notes"
```

Add a custom additional metadata field:
```bash
spl-token update-metadata [MINT_ADDRESS] rarity legendary
```

Remove that custom field:
```bash
spl-token update-metadata [MINT_ADDRESS] rarity --remove
```

Point the NFT at a new metadata JSON:
```bash
spl-token update-metadata [MINT_ADDRESS] uri https://gist.githubusercontent.com/janvinsha/6f8187a0b15de99c03a1b07e82db36e9/raw/83e33a3529d07df1f4d60bf7d543c5b72b5314e2/metadata.json
```

## Terminal session

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
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token update-metadata nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 name "Field Notes"

Signature: 3kAWXdLcUNuV1WGDL2pKZex4bF7eGCF9XmPxPnqnAWQuBimpPVKVKSMGbJUNtuA3ogSAtwsriZtEgPXtC1pe9zCQ

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token update-metadata nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 rarity legend

Signature: 47wJ5M5mVgGgsZxFBntSyWTTNo5cb99y5M6RsuTdtMtHgu4P4h8NsA959UvTe5sXQP2HdxWYkAG9PGRwpjPYoCai

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token update-metadata [MINT_ADDRESS] rarity --remove
error: Invalid value "[MINT_ADDRESS]" for '<TOKEN_MINT_ADDRESS>': unrecognized signer source

For more information try --help
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token update-metadata nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 uri https://gist.githubusercontent.com/janvinsha/6f8187a0b15de99c03a1b07e82db36e9/raw/83e33a3529d07df1f4d60bf7d543c5b72b5314e2/metadata.json

Signature: 4DajdaSdVrcssf8sxBtru4pEuG8xVySY3sJcQ5SUc3GDkGcKso97FzwLttK2TgNN7jdMvQwmMabW6ZvvztL44af5

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token update-metadata nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 rarity --remove

Signature: 3qzjizte4ySJqw3qXJ595SBsQi3oQbBAaeTkpHxUfKKB1DXovXakZYV4qUavnYQqG1nZp326u4sR2uEaYtbZ8z7A
```

Note: I forgot to swap in the real mint address for the placeholder `[MINT_ADDRESS]` on the first `--remove` attempt, which errored with `unrecognized signer source`. Substituting the actual mint address fixed it.
