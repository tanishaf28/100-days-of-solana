# Week 6

| Weekday | Theme | Goal | Day | What I actually did |
|---|---|---|---|---|
| Mon | ▶️ Try | Understand the idea | [Day 36](day36.md) | Created a Token-2022 mint with the interest-bearing extension (5% initial rate), minted supply, and bumped the rate to 15000bps with set-interest-rate. |
| Tue | 🛠️ Build | Get it working | [Day 37](day37.md) | Built a single mint (ArcCoin/ARC) combining transfer fees, an interest rate, and metadata, then minted, transferred, and harvested the withheld fee. |
| Wed | 📈 Stretch | Go further | [Day 38](day38.md) | Created a mint with default-account-state frozen, showed minting/transfers fail on frozen accounts, then thawed both sender and recipient accounts to complete a transfer. |
| Thu | 📌 Reinforce | Make it stick | [Day 39](day39.md) | Reviewed the week's three mints side by side, comparing extension sets, account data size, and approximate rent cost in a summary table. |
| Fri | 🧪 Experiment | Try your own approach | [Day 40](day40.md) | Built a non-transferable "Solana Dev Credential" token with a permanent delegate, confirmed the holder can't transfer it, and burned it from the delegate side. |
| Sat | 📝 Document | Write on [DEV](https://dev.to/) | [Day 41](day41.md) | Wrote "Reading a Token Mint: How I Learned to Inspect On Chain Configuration", comparing the week's three mints through `spl-token display` - published post: [Reading a Token Mint: How I Learned to Inspect On Chain Configuration](https://dev.to/tanisha_fonseca/reading-a-token-mint-how-i-learned-to-inspect-on-chain-configuration-1emm) |
| Sun | 🚀 Amplify | Learn from others | [Day 42](day42.md) | Shared the week's token-extensions work on X (metadata, transfer fees, non-transferable flag, and the runtime rejecting a transfer with no app code involved), linking back to the Day 41 "Reading a Token Mint" post - shared post: [built a Solana token with metadata, transfer fees, and a non-transferable flag](https://x.com/tanishhaa_28/status/2080347343719686229?s=20) |
