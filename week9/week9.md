# Week 9

| Weekday | Theme | Goal | Day | What I actually did |
|---|---|---|---|---|
| Mon | ▶️ Try | Understand the idea | [Day 57](day57.md) | Installed AVM and Anchor, scaffolded a new `counter` Anchor project with `anchor init`, toured the generated files, and ran `anchor build` for the first time. |
| Tue | 🛠️ Build | Get it working | [Day 58](day58.md) | Wrote the `Counter` account and `initialize` instruction in `lib.rs`, then added a LiteSVM Rust integration test (`initialize_sets_count_to_zero`) that builds and sends a real transaction. |
| Wed | 📈 Stretch | Go further | [Day 59](day59.md) | Added an `increment` instruction with a `has_one = authority` constraint and `checked_add`, then rewrote the test as `initialize_then_increment`, exercising both instructions end to end. |
| Thu | 📌 Reinforce | Make it stick | [Day 60](day60.md) | Extracted shared test helpers (`setup_svm_with_program`, `build_initialize_tx`, `build_increment_tx`) and added two negative tests: wrong-authority increment rejection and duplicate-initialize rejection. |
| Fri | 🧪 Experiment | Try your own approach | [Day 61](day61.md) | Deliberately broke the program three ways (removed `has_one = authority`, changed `checked_add(1)` to `checked_add(2)`, commented out the authority assignment in `initialize`) and confirmed the test suite caught each regression. |
| Sat | 📝 Document | Write on [DEV](https://dev.to/) | [Day 62](day62.md) | Wrote up the week's Anchor counter program, the accounts-struct-as-authorization mental model, and how the Day 60 test caught the Day 61 regression - published post: [The Regression That Never Shipped: How My Own Test Caught a One-Line Anchor Bug Before Anyone Else Could](https://dev.to/tanisha_fonseca/how-my-own-test-caught-a-one-line-anchor-bug-before-anyone-else-could-4agf) |
| Sun | 🚀 Amplify | Learn from others | [Day 63](day63.md) | Posted on X about writing a test that expects the wrong wallet to be rejected, then deleting `has_one = authority` just to watch the suite turn red - shared post: [X post](https://x.com/tanishhaa_28/status/2081073331827032081?s=20) |
