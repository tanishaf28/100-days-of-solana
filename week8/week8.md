# Week 8

| Weekday | Theme | Goal | Day | What I actually did |
|---|---|---|---|---|
| Mon | ▶️ Try | Understand the idea | [Day 50](day50.md) | Created a Token-2022 mint with the Transfer Fee extension (100 bps, 1,000,000 max fee cap) and minted a starting supply of 1,000 tokens (mint `2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf`). |
| Tue | 🛠️ Build | Get it working | [Day 51](day51.md) | Transferred 1,000 fee-bearing tokens to a throwaway recipient wallet, confirmed 10 tokens were withheld on the recipient's account, then withdrew the withheld fees back to my own token account. |
| Wed | 📈 Stretch | Go further | [Day 52](day52.md) | Stacked Transfer Fee and Interest Bearing (5000 bps) extensions on one mint and watched the displayed UI balance climb over 30 seconds with zero transactions sent (mint `HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B`). |
| Thu | 📌 Reinforce | Make it stick | [Day 53](day53.md) | Ran `spl-token display` against the Day 50 and Day 52 mints side by side and wrote a plain-English sentence describing what each extension (Transfer Fee, Interest Bearing) actually does. |
| Fri | 🧪 Experiment | Try your own approach | [Day 54](day54.md) | Created a non-transferable mint, minted one token to myself, and confirmed the Token-2022 program rejects any transfer attempt with a "Transfer is disabled for this mint" error (custom error 0x25). |
| Sat | 📝 Document | Write on [DEV](https://dev.to/) | [Day 55](day55.md) | Wrote up all three Token-2022 mints from the week (transfer fee, stacked transfer fee + interest bearing, non-transferable) with commands and addresses - published post: [Three Token 2022 Mints in One Week: Fees, Yield, and a Token That Refuses to Move](https://dev.to/tanisha_fonseca/three-token-2022-mints-in-one-week-fees-yield-and-a-token-that-refuses-to-move-3p8g) |
| Sun | 🚀 Amplify | Learn from others | [Day 56](day56.md) | Posted an X thread summarizing the transfer-fee, interest-bearing, and non-transferable mints and linking to the Day 55 write-up - shared post: [X thread](https://x.com/tanishhaa_28/status/2080353059763363913?s=20) |
