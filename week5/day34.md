---
title: What I Learned About Token Design on Solana as a Web2 Developer
published: true
tags: solana, blockchain, webdev, beginners
cover_image:
---

A week ago my Solana tokens were just random strings of characters. No name, no rules, no personality. By the end of this week I had built tokens that charge their own fees, tokens that refuse to move at all, and one token that does both a job and a favor at the same time. Here is what building on Token Extensions taught me that no Web2 platform ever could.

## Where I Started

Coming from a Web2 background, my mental model of a "token" was basically a row in a database with a balance column. If you wanted that token to have a name, you joined it against another table. If you wanted a transaction fee, you wrote middleware that intercepted the transfer request before it hit the database. If you wanted something that could never be resold, you wrote an if statement in your application code and hoped every client respected it.

Solana's Token Extensions Program throws that whole model out. A mint can carry its own name and symbol directly on the account. It can enforce a fee on every transfer without a single line of custom backend code. It can refuse to move at all, and that refusal happens inside the program itself, not inside code I wrote. Every rule I used to build by hand turned out to already be a flag.

## The Walkthrough

### Giving a token an identity

My very first real mint had no name at all. It was just an address, `GscCeGeQhmN92SLaXAHoWee78KKb5PBkTrkMiYdy2Nc8`, and looking at it in an explorer felt like opening a spreadsheet with no column headers. Adding metadata fixed that in one command:

```bash
spl-token create-token \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --enable-metadata \
  --decimals 9

spl-token initialize-metadata GscCeGeQhmN92SLaXAHoWee78KKb5PBkTrkMiYdy2Nc8 \
  "ReinforceCoin" "RFC" \
  "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/CompressedCoil/metadata.json"
```

In Web2 terms, this is the equivalent of defining your loyalty program's display name and icon before you let a single user earn points. Except here, the name lives on the same account as the balance logic. There is no separate metadata service to keep in sync.

### Making the protocol charge a fee for you

Next I created a mint with a transfer fee baked in at creation time, `BzJPUdX7kfiXzowvXwNMQgpqCbae5XwbDRWxp92mwAgs`, set to 1 percent:

```bash
spl-token create-token \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 5000
```

I sent 100 tokens to a second wallet expecting it to receive 100. It received 99. The missing token was not lost, it was withheld directly on the recipient's own account, untouchable by them, waiting for the withdraw authority to sweep it out:

```bash
spl-token withdraw-withheld-tokens CftRHxRFNNwKS5LbTZ6L6sqVtQ57LbmfDqEuKHzmWLxs \
  4x3o6cotxU4fqrPtetdTmKgGkMK86pb4FfZm93i1TUJt
```

My balance went from 900 to 901. No payment processor, no webhook, no reconciliation job. The fee collection was a property of the mint itself.

### Stacking both on one mint

Once I understood each extension separately, I combined them on a single mint, `9LqGwgZKcjBJ3ccUv4uftRWoNdKAive2u4fueonCKNA`, named ReinforceCoin, carrying both metadata and a 2 percent transfer fee at the same time. A transfer of 100 tokens left 98 in the recipient's spendable balance and 2 sitting in withheld state, exactly the same mechanic as before, just running alongside a name and symbol instead of on its own. Nothing about adding metadata changed how the fee behaved, and nothing about the fee changed how the metadata rendered.

### Building something that refuses to move

The most interesting mint of the week was also the simplest command. Adding one flag, `--enable-non-transferable`, produced a token that the protocol will not let anyone move:

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-non-transferable
```

I minted 10 of these tokens, then deliberately tried to send some to a second wallet just to watch it fail. The rejection came straight from the program:

```text
Program log: Instruction: TransferChecked
Program log: Transfer is disabled for this mint
Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb failed: custom program error: 0x25
```

That is the difference between a rule and a suggestion. In Web2, "this credential cannot be transferred" is a line in your terms of service or, at best, a check in your API. Here it is enforced the same way gravity is enforced. There is no client anyone could write that gets around it, because the rejection happens inside the token program, not inside application code.

## What Surprised Me

I expected non-transferable to mean the tokens were frozen solid, permanent in every sense. It does not mean that. Burning them still works perfectly:

```bash
spl-token burn 2joYCLK6QTfQ1FwsKijU7dMn2CDM8r6YZ3asoVxGL61j 3 \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
```

My balance dropped from 10 to 7, no error, no resistance. That distinction clicked for me instantly. Non-transferable does not mean the owner loses control of the token, it means the token loses the ability to change hands. The owner can still destroy what they hold. They just cannot hand it to someone else. That single detail is what makes the soulbound pattern actually useful for things like credentials and completion certificates, where you want the holder to keep authority over their own asset without being able to sell or trade it away.

## What's Next

Every extension this week lived on its own mint or paired with just one other. Next I want to push further and see how many of these can realistically stack on a single token before the account size and rent costs start to matter, and start looking at how a real application would read this on-chain configuration instead of relying on the CLI to decode it for me.

This post is part of #100DaysOfSolana. Follow along or jump in any day.
