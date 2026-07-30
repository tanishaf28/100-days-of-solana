---
title: Reading a Token Mint: How I Learned to Inspect On Chain Configuration
published: true
tags: solana, web3, learning, 100daysofsolana
cover_image:
---

In Web2, when you want to know what a database table can and cannot do, you open a schema file or a migration history. Someone owns that file, and you need permission to see it. On Solana, the schema of a token lives inside the token itself, and anyone can read it with a single command. No credentials, no support ticket, no asking a teammate what a column means. This week I spent five days building mints with different Token Extensions, then spent one more day just reading them back. That reading exercise taught me more than the building did.

## What Extensions Actually Are

A plain SPL token only ever has a supply, a number of decimals, a mint authority, and maybe a freeze authority. Token Extensions let you attach extra configuration to that same mint account, so behaviors that used to require a custom program become flags you pass when you create the token. Over five days I tried five of these:

An interest bearing rate, which changes the balance a wallet displays over time without minting new supply.

A transfer fee, which skims a percentage off every transfer and holds it on the recipient's account until someone with the withdraw authority claims it.

A metadata pointer, which lets the mint carry its own name, symbol, and a link to a JSON file describing it, all without a separate metadata program.

A default frozen account state, which means every new token account for that mint starts locked until someone with the freeze authority thaws it.

A non transferable flag paired with a permanent delegate, which together create a token that cannot be sent by its owner but can still be seized by whoever holds the delegate authority.

Five extensions, five different mints, and every single one of them is just a set of bytes sitting on a mint account that `spl-token display` knows how to decode.

## One Command, Read Three Ways

The single most useful command all week was not a create or a mint command. It was this one, run against three completely different mints:

```bash
# spl-token display simply reads the mint account and decodes
# whatever extensions were turned on when it was created.
# No two of my three mints below have the same shape.

spl-token display 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk
spl-token display 8cEnXrjaAPCLMy99xNXRopmiXn7XpHPD95av3Ed1FvWK
spl-token display 49js8sdgQKhLuyxG5TnmQpNAB3Abc879ZbMEPkcehtpN
```

The first mint, the interest bearing one, printed a short Extensions block with just one entry: a current rate and an average rate. The second mint, which stacked a transfer fee, an interest rate, and metadata all on the same account, printed four separate extension blocks, one after another, all decoded from a single account. The third mint, built with a default frozen state, printed a single line reading `Default state: Frozen`, and that one line was the entire reason every account created under it starts out locked.

Reading these side by side made the underlying idea click. Extensions are stored as a list of type length value entries packed into the mint's account data, one after another, and the CLI just walks that list and prints whatever it finds. A mint with one extension and a mint with four extensions are the same kind of account, just with a longer list.

## What Surprised Me, What Confused Me, What Clicked

The part that confused me at first was the frozen mint. Minting to a fresh account failed with `Error: Account is frozen`, even though I had never explicitly frozen anything. It took rereading the extensions block to realize the mint itself carries a rule that says every new account starts frozen, so the freeze was never a separate action, it was the default from the moment the account was created.

The part that surprised me was the non transferable mint with a permanent delegate attached. Creating a token account under that mint printed a warning in the transaction logs, right there in plain text: tokens in this account may be seized at any time. Attempting a transfer afterward failed with the exact same error code you get from a plain non transferable mint, `Transfer is disabled for this mint`, but the presence of a permanent delegate changes what that rejection actually means. The token cannot move on its own, but it is not frozen in the sense of being untouchable. Whoever holds the delegate key can still act on it. That is the shape of a soulbound credential: something a user carries but never controls outright, closer to an ID card than a coin.

What clicked, by the end, is that auditing a mint is not a special skill separate from building one. It is the same `spl-token display` command you already used to confirm your own work, pointed at someone else's mint instead. The account is public. The extensions are public. The only thing that changes is whose configuration you are reading.

If you want to go past what I covered here, the official Token Extensions guide walks through every extension in more depth than a five day sprint can, including ones I have not touched yet like confidential transfers and CPI guards. That is where I am headed next.

This post is part of #100DaysOfSolana.
