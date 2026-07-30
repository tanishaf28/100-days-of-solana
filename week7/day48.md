---
title: What I Learned Minting NFTs on Solana With Token Extensions
published: true
tags: solana, nft, rust, webdev
cover_image:
---

Before this week I thought a Solana NFT was a Metaplex thing. It turns out you can mint a full NFT, complete with metadata and a collection, using nothing but the Token Extensions program. No separate metadata program, no extra account you have to create by hand. Just flags on a token you already know how to create.

## The Mental Model

Coming from Web2, the phrase NFT sounds like it needs its own special data type somewhere. On Solana it does not. An NFT is just a mint with supply 1 and decimals 0. That is the entire definition. A regular fungible token might have a supply of a million and six decimal places so you can split it into fractions. An NFT locks supply to exactly one unit that cannot be divided, which is what makes it non fungible in the first place.

Everything else, the name, the symbol, the image, the traits, comes from extensions layered on top of that same mint. The Metadata extension stores a name, a symbol, and a URI directly on the mint account. The URI points to a small JSON file, hosted anywhere public, that describes the image and any traits. The Group and Member extensions let you link separate mints together into a collection, the same way a foreign key links a row in one table to a row in another.

Once you see it this way, an NFT stops looking like a special object and starts looking like a token with a couple of extra fields turned on.

## What I Built

**A single NFT with on chain metadata.** I generated a vanity mint address, created a Token 2022 mint with `--enable-metadata` and zero decimals, then wrote the name, symbol, and metadata URI straight onto the mint:

```bash
spl-token create-token \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --enable-metadata \
  --decimals 0 \
  ./nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1.json

spl-token initialize-metadata \
  nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 \
  "First Light" \
  "LIGHT" \
  https://gist.githubusercontent.com/tanishaf28/f289de34f9a628bfe64d3db2972646f3/raw/88dc687242ee1c21e119d639f608996f6051ce47/metadata.json
```

After minting exactly one unit and disabling the mint authority, `spl-token display` showed a Metadata block sitting right on the mint account with the name First Light, the symbol LIGHT, and the URI I set. No separate metadata account to look up, no off chain indexer required to know the name of my own token.

**A collection built from Group and Member extensions.** Next I created one collection mint with `--enable-group`, gave it a max size of 3, and then created two member mints with `--enable-member`, linking each one back to the collection with `initialize-member`:

```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token \
  --decimals 0 \
  --enable-metadata \
  --enable-group

spl-token initialize-group zP92TyP2k8vPeXhgZ2sPfdaBYVpSC6GVHEzV7ck1chx 3

spl-token initialize-member BEUZXPdd9jKuxq24LNyb9XZ1Pj9vGLQpkBakMx7khpV zP92TyP2k8vPeXhgZ2sPfdaBYVpSC6GVHEzV7ck1chx
```

Displaying the collection mint afterward showed a Token Group entry with `Size: 2` and `Max Size: 3`, and each member mint carried a Token Group Member entry pointing straight back at the collection address. That address matched byte for byte, the same way a foreign key resolves correctly between two tables.

**A metadata audit and a live mutation.** I compared the NFT mint against an old fungible mint from earlier weeks to see the difference plainly: no Extensions block at all on the old mint, versus a full Metadata Pointer, Metadata, and Group Member Pointer section on the new one. Then, on devnet, I renamed the NFT from First Light to Field Notes, added a custom field called rarity, watched it show up in the Explorer, removed it again, and finally pointed the URI at a brand new metadata JSON file:

```bash
spl-token update-metadata nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 name "Field Notes"
spl-token update-metadata nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 rarity legend
spl-token update-metadata nftas3HnBMBdAfxGgiun4oQRESggSsb6iSF2MEsqac1 rarity --remove
```

## The Surprising Part

The additional_metadata field on the Metadata extension is an open schema. I expected NFT metadata to follow a fixed shape, name, symbol, image, maybe an attributes array, and nothing else. Instead the extension lets you store any key and value pair you want directly on chain, and the Explorer picks it up the moment the transaction confirms. Adding a field called rarity was no different from adding a field called anything else. There is no predefined list to conform to.

The second surprise was realizing how much of an NFT's identity lives off chain by design. The mint account only ever stores a URI, a pointer, not the image itself. When I swapped that URI to point at a new JSON file, the on chain change was instant, but the wallet I tested with kept showing the old image for a while afterward because it had cached the previous file. The chain updated immediately. The picture people actually see took longer, because that part of the system was never on chain to begin with.

## What I Would Build Next

I want to try minting a small collection where every member's metadata URI points at a JSON file I generate dynamically from a tiny backend, instead of a static gist. That would let the image and traits update based on some on chain or off chain event, closer to how a real dynamic NFT project would work rather than a fixed collectible.

This post is part of #100DaysOfSolana. Follow along or jump in any day.
