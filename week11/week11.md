# Week 11

| Weekday | Theme | Goal | Day | What I actually did |
|---|---|---|---|---|
| Mon | ▶️ Try | Understand the idea | [Day 71](day71.md) | Built `sol-mover`, a first CPI that moves SOL by calling the System Program's `transfer` through `CpiContext::new`, and tested that the recipient's balance actually increased. |
| Tue | 🛠️ Build | Get it working | [Day 72](day72.md) | Built `token_cpi`, a program that mints Token-2022 tokens via a `mint_to` CPI using `InterfaceAccount`/`Interface` types so the same code works against the classic Token Program too. |
| Wed | 📈 Stretch | Go further | [Day 73](day73.md) | Built a `vault` program where `deposit` uses a plain CPI (the user already signed) and `withdraw` uses `.with_signer(signer_seeds)` so the PDA vault can sign for itself; tested a full deposit/withdraw cycle. |
| Thu | 📌 Reinforce | Make it stick | [Day 74](day74.md) | Built `compose-lab`, a two-program workspace where the caller uses `declare_program!` plus the callee's IDL to run a CPI into my own second Anchor program and increment its counter. |
| Fri | 🧪 Experiment | Try your own approach | [Day 75](day75.md) | Deliberately broke the Day 73/74 programs three ways (bad signer seeds, a missing/changed account constraint, and a CPI aimed at the wrong program ID) and mapped each failure's log line back to its cause. |
| Sat | 📝 Document | Write on [DEV](https://dev.to/) | [Day 76](day76.md) | Wrote up the week's CPI throughline: `CpiContext::new(program_id, accounts)` is the same three-piece shape whether calling the System Program, Token-2022, or my own program, illustrated with the Day 75 wrong-program-ID failure - published post: [The Same Four Lines of Anchor Called Three Completely Different Programs](https://dev.to/tanisha_fonseca/the-same-four-lines-of-anchor-called-three-completely-different-programs-1eeh) |
| Sun | 🚀 Amplify | Learn from others | Day 77 | Not written yet, week in progress. |
