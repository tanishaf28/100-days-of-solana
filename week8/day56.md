# Day 56: Sharing the Token-2022 Extensions Week on X

Posted a thread on X recapping the week's three Token-2022 mints.

Thread link: [https://x.com/tanishhaa_28/status/2080353059763363913?s=20](https://x.com/tanishhaa_28/status/2080353059763363913?s=20)

## Thread content

I spent four days building Solana tokens that charge fees, pay interest, and refuse to move, and the protocol does all of it natively. No middleware, no custom program, no cron job. Full write-up in the thread. #100DaysOfSolana

Mint 1: transfer fee. `--transfer-fee-basis-points 100` skims 1% on every send, held right on the recipient's account until withdrawn. Sent 1000 tokens, 10 got withheld automatically. #Token2022

Mint 2: interest-bearing. Balance climbed from 1000001.03 to 1000001.51 in 30 seconds with zero transactions. Supply never moved, only the displayed UI amount recalculates from the rate and elapsed time.

Mint 3: non-transferable. Tried sending it anyway. The program itself rejected it: "Transfer is disabled for this mint," custom error 0x25. No app-level check, the runtime just says no. #Solana

Full breakdown of all three mints, commands included: [https://dev.to/tanisha_fonseca/three-token-2022-mints-in-one-week-fees-yield-and-a-token-that-refuses-to-move-3p8g](https://dev.to/tanisha_fonseca/three-token-2022-mints-in-one-week-fees-yield-and-a-token-that-refuses-to-move-3p8g)

Shipped with memo transfer, confidential transfers, or default account state? Tell me what surprised you.

Posted Jul 23.
