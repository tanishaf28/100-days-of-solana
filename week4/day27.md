---
title: Solana's Account Model, Explained for Web2 Developers
published: true
tags: solana, blockchain, web3, beginners
cover_image:
---

If you have spent any time building web applications, you already understand files, databases, and permissions. That is genuinely all you need to understand Solana's account model. The vocabulary is new, but the shape of the idea is one you already carry around in your head every day.

## Everything Is an Account

Some blockchains draw a hard line between a wallet and a smart contract. Ethereum, for example, has "externally owned accounts" for wallets and "contract accounts" for code, and the two behave differently under the hood.

Solana does not bother with that split. Everything on Solana, a wallet, a program, a token mint, a piece of NFT metadata, is the same kind of object: an account. Every account lives in one giant flat key value store. The key is a 32 byte address. The value is the account itself.

I confirmed this for myself with a small Node script I wrote on Day 23, which just asks an RPC endpoint for whatever address you hand it:

```javascript
const { value: accountInfo } = await rpc
  .getAccountInfo(targetAddress, { encoding: "base64" })
  .send();
```

Pointing that script at my own devnet wallet and at the System Program itself returned two accounts with the exact same shape, just filled in differently:

```text
Address:    DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
Balance:    13.80205188 SOL (13802051880 lamports)
Owner:      System Program (11111111111111111111111111111111)
Executable: false
Data size:  0 bytes
Rent epoch: 18446744073709551615
```

```text
Address:    11111111111111111111111111111111
Balance:    1e-9 SOL (1 lamports)
Owner:      NativeLoader1111111111111111111111111111111
Executable: true
Data size:  14 bytes
Rent epoch: 18446744073709551615
```

One of those is my personal wallet. The other is the System Program, the closest thing Solana has to an operating system kernel. Same five fields on both. That consistency is the whole point.

## The Five Fields Every Account Has

No matter what an account is used for, it always carries exactly five pieces of information:

**lamports**: the account's SOL balance, measured in the smallest possible unit. One SOL equals one billion lamports, the same way one dollar equals one hundred cents, just with more zeros.

**data**: a raw byte array where whatever state the account holds actually lives. For a plain wallet this is empty. For a program or a token mint it can be dense with structured information.

**owner**: the address of the program allowed to modify this account's data or debit its lamports. This is the field that quietly runs the entire security model.

**executable**: a simple true or false flag. True means this account holds runnable program code. False means it just holds data.

**rent_epoch**: a leftover field from an old rent collection mechanism. Every account you look at today has it set to the maximum possible value, which is Solana's way of saying this field no longer does anything.

You can see all five sitting right next to each other in the raw JSON if you ask an RPC node directly instead of going through a script:

```json
{
  "lamports": 13802051880,
  "data": ["", "base64"],
  "owner": "11111111111111111111111111111111",
  "executable": false,
  "rentEpoch": 18446744073709551615
}
```

## Ownership Is the Whole Security Model

Here is the rule that makes everything else make sense: only the program listed in an account's owner field is allowed to change that account's data or take lamports out of it. Anyone in the world can send lamports into an account, the same way anyone can drop a letter in your mailbox, but only you can open it and rearrange what is inside.

This is why a plain wallet like mine is owned by the System Program. I am not running custom logic on my balance, so the most basic program on the network handles it: move lamports in, move lamports out, nothing fancier. A token mint, by contrast, is owned by the Token Program, because minting and burning supply requires logic that the System Program was never built to run.

## Programs Do Not Store Their Own State

This is the part that took me a second to fully absorb, because it breaks a habit from years of writing backend code. On Solana, a program's account only ever holds compiled, executable bytecode. It does not hold a user's balance, a game's leaderboard, or a mint's supply. That state lives in separate accounts, and the program simply reads and writes to those accounts when instructed to.

I saw this directly while decoding Wrapped SOL's mint account on Day 24. The mint account itself is owned by the Token Program, but all the interesting information, decimals, supply, whether it has a mint authority, lives inside that one account's data field, which the Token Program knows how to interpret:

```javascript
const mintDecoder = getMintDecoder();
const mint = mintDecoder.decode(dataBytes);
```

```text
Mint Authority: None
Supply: 0
Decimals: 9
Is Initialized: true
Freeze Authority: None
```

Think of it like a running web server and a database sitting on two separate machines. The server, your program, has logic but no memory of its own between requests. The database, your data accounts, has no logic but holds every fact worth remembering. Solana just makes that split explicit and enforces it at the protocol level instead of leaving it as an architectural choice.

## Staying On Chain Costs a Tiny Deposit

Every account needs to hold a minimum lamport balance to stay alive on the network, scaled to how much data it stores. This is called being rent exempt. A bare account with no extra data needs roughly 0.00089 SOL sitting in it, and larger accounts need proportionally more. Fall below that minimum and the account can eventually be swept off the chain to free up space.

You do not have to guess this number. You can ask for it directly:

```bash
solana rent 0
```

or call `getMinimumBalanceForRentExemption` from code if you want the exact figure for a specific data size. In Web2 terms, it is a bit like a cloud storage bill you pay once up front instead of monthly, a small deposit that buys the account permanent residency on the ledger.

## The Analogy That Tied It Together For Me

If you want one mental model to hold onto, think of Solana's accounts like a filesystem. Every account is a file. Every file has metadata, an owner, permissions, a size, sitting right alongside its contents. Programs are like executable files. Data accounts are like the documents those executables read from and write to. The System Program is the kernel, the thing responsible for creating new files and handing off ownership from one program to another.

Once that clicked, the rest of Solana stopped feeling like a new paradigm and started feeling like a filesystem with a very strict permissions model and a small hosting fee.

If you want to go deeper than a week of hands on exploring can cover, the official Solana accounts documentation and QuickNode's introduction to the account model are both worth reading next.

This post is part of #100DaysOfSolana.
