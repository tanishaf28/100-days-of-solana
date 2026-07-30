# Day 26: Explorer Challenge, Finding Something Interesting On-Chain

## The Challenge

Using Solana Explorer, find something interesting on devnet or mainnet and write a short explanation of what I found. This could be a large transaction, an active program, a wallet with unusual activity, a token I haven't heard of, anything that catches my attention.

## What I'll Need

- A web browser
- Solana Explorer

## Where to Start

If I'm not sure what to look for, here are a few starting points:

1. Paste one of the transaction signatures from a transfer I sent in Arc 3 into the Explorer search bar. This shows the full transaction details: the accounts involved, the instructions that were executed, the fees paid, and whether it succeeded or failed.
2. Switch the Explorer to mainnet (using the network dropdown in the top bar) and search for the Token-2022 program address I queried in Arc 2: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`. Compare what shows up there with what I saw on devnet.
3. Browse the Solana Explorer programs page to see a list of verified programs running on mainnet. Pick one and look at its recent transaction activity.
4. Look at the Explorer homepage on mainnet. It shows live network stats: transactions per second, the current slot number, and recent activity. Watch the slot numbers tick up in real time to get a feel for how fast the network moves.

## What to Pay Attention To

As I explore, notice how everything connects. Transactions reference accounts. Accounts are owned by programs. Programs process instructions. Every piece of data I've been reading through RPC calls over the past weeks is visible here in a different format.

Also, notice what's public: wallet balances, transaction histories, program activity. None of this data is hidden. This is the same principle I've been working with throughout this program, but seeing it in a visual interface makes its scale more concrete.

## Resources

- Solana Explorer (devnet)
- Solana Explorer (mainnet)
- Solana Explorer verified programs
