# Week 3

| Weekday | Theme | Goal | Day | What I actually did |
|---|---|---|---|---|
| Mon | ▶️ Try | Understand the idea | [Day 15](day15.md) | Sent a devnet transfer, inspected it with `solana confirm -v` and Solana Explorer, and mapped the signatures/message/header/account-keys structure to an HTTP request analogy. |
| Tue | 🛠️ Build | Get it working | [Day 16](day16.md) | Used the Solana CLI end to end: set config to devnet, airdropped SOL, generated a recipient keypair, sent a 0.5 SOL transfer with `--allow-unfunded-recipient`, and verified both balances. |
| Wed | 📈 Stretch | Go further | [Day 17](day17.md) | Built `sol-transfer-tool`, a Node CLI using `@solana/kit` and `@solana-program/system` to sign and send real SOL transfers on devnet from the command line. |
| Thu | 📌 Reinforce | Make it stick | [Day 18](day18.md) | Upgraded the transfer tool to poll and report each commitment stage (processed, confirmed, finalized) individually instead of waiting on a single all-in-one confirm call. |
| Fri | 🧪 Experiment | Try your own approach | [Day 19](day19.md) | Wrote a recap post on transaction anatomy, the 1,232-byte transaction size limit, and deliberately triggering a failed transaction to confirm that fees are charged even when a transfer fails. |
| Sat | 📝 Document | Write on [DEV](https://dev.to/) | [Day 20](day20.md) | Published "I Built a CLI That Signs and Sends Real SOL, and Then I Made It Fail on Purpose," walking through the transfer tool's code, the staged confirmation upgrade, and a script that intentionally fails on-chain with `skipPreflight: true` - shared post: [X post](https://x.com/tanishhaa_28/status/2080347908612735232?s=20) |
| Sun | 🚀 Amplify | Learn from others | [Day 21](day21.md) | Shared a short highlight on the two CLIs built this week (one that transfers SOL, one that deliberately fails a transfer) and the lesson that failed transactions still cost fees - shared post: [X post](https://x.com/tanishhaa_28/status/2080341976214364351?s=20) |
