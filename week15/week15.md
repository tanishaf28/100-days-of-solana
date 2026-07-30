# Arc 15 (week15): Capstone and Reflection

Days 99 and 100 are the two special closing days of the program, outside the normal Mon-Sun rhythm: a capstone build day, then a whole-program reflection day. No Try/Build/Stretch/Reinforce/Experiment/Document/Amplify split here, just the two milestones.

| Day | Type | What I actually did |
|---|---|---|
| [Day 99](day99.md) | Capstone | Built "Proof of Ship," an Anchor program that records a `ShipRecord` PDA (`["ship", wallet_address]`) so each wallet can ship exactly one capstone claim on-chain. Deployed to devnet (`2Xcaj4c6rKoXdsjw86bcjmXqfApVLwCS5V5y45oGXbRT`), with a passing success test and a passing duplicate-rejection test. |
| [Day 100](day100.md) | Reflection | Published a whole-program retrospective, built around one thesis: on Solana, safety is declared in types and constraints, not remembered as checks, traced from Day 14's public-accounts moment through Day 61's regression test, a Week 11 CPI mistake, the Day 82 Wormhole rebuild, and the Week 14 Ollama agent, then tied back to the Day 99 capstone's own PDA design - published post: [100 Days of Solana: The Lesson That Kept Repeating, From My First Wallet to an AI Agent With a Spending Cap](https://dev.to/tanisha_fonseca/100-days-of-solana-the-lesson-that-kept-repeating-from-my-first-wallet-to-an-ai-agent-with-a-468m) |
