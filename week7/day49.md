# Day 49: Sharing the NFT Week on X

Posted a thread on X recapping the week's NFT and metadata work.

Thread link: [https://x.com/tanishhaa_28/status/2080350682960273609?s=20](https://x.com/tanishhaa_28/status/2080350682960273609?s=20)

## Thread content

I spent a week minting NFTs on Solana and realized something most people don't know:

The metadata isn't stored separately.

It lives inside the mint account itself: name, symbol, URI, alongside supply and decimals.

Collections work the same way. One mint gets `--enable-group` and becomes the parent. Each NFT mint gets `--enable-member` and points back with a Group address that has to match byte for byte.

It's basically a foreign key that lives on-chain.

Then I tried something wild: I mutated metadata live on devnet.

- Renamed the NFT
- Added a custom field
- Changed the image URI

All updated in seconds on Explorer. No redeploy. No new mint. Same account. New bytes.

Full write-up (Day 49 of #100DaysOfSolana): [https://dev.to/tanisha_fonseca/from-mint-to-reality-what-solana-token-extensions-taught-me-114](https://dev.to/tanisha_fonseca/from-mint-to-reality-what-solana-token-extensions-taught-me-114)

@solana @solana_devs

Posted 1:53 PM, Jul 23, 2026.
