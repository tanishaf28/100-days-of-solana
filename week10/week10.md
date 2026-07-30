# Week 10

| Weekday | Theme | Goal | Day | What I actually did |
|---|---|---|---|---|
| Mon | ▶️ Try | Understand the idea | [Day 64](day64.md) | Wrote a `derive-pda.ts` script and used `findProgramAddressSync` to see how seeds and the canonical bump deterministically produce a PDA. |
| Tue | 🛠️ Build | Get it working | [Day 65](day65.md) | Built a per-user Anchor counter program with `init_counter` and `increment`, using `seeds = [b"counter", user.key().as_ref()]` as the access control, and wrote a passing Mocha test for it. |
| Wed | 📈 Stretch | Go further | [Day 66](day66.md) | Added a singleton Config PDA (admin, paused flag, total_counters) and a pause switch, so `increment` now checks the config before running. |
| Thu | 📌 Reinforce | Make it stick | [Day 67](day67.md) | Added a `close_counter` instruction using `close = user` and `has_one = user`, and tested that closing an account refunds its rent lamports back to the owner. |
| Fri | 🧪 Experiment | Try your own approach | [Day 68](day68.md) | Wrote an `explore-collisions.ts` script to compare per-user vs. global PDA derivation, tried near-miss seed variants, and confirmed Anchor rejects a spoofed PDA passed from the wrong signer. |
| Sat | 📝 Document | Write on [DEV](https://dev.to/) | [Day 69](day69.md) | Wrote up the week's PDA mental model (derivation, the canonical bump, seeds as a compound key, and the full derive/init/mutate/close lifecycle) - published post: https://dev.to/tanisha_fonseca/what-i-learned-about-pdas-in-a-week-of-building-on-solana-1ege |
| Sun | 🚀 Amplify | Learn from others | [Day 70](day70.md) | Shared the PDA write-up on X with a short summary of the core idea (a PDA as something the program can prove it derived, not something it owns) - shared post: https://x.com/tanishhaa_28/status/2081875095966884230?s=20 |
