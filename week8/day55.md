# Three Token 2022 Mints in One Week: Fees, Yield, and a Token That Refuses to Move

If you have never touched Solana before, here is the one sentence version. Token 2022 is the upgraded version of Solana's standard token program, and it ships with a set of optional extensions you can turn on when you create a mint. Think of extensions the way you think of middleware in a Web2 stack: small pieces of logic that sit between an action and its result, without you having to fork or rewrite the core program. Want every transfer to skim a fee? Turn on an extension. Want a balance to earn interest automatically? Turn on an extension. Want a token that can never be sent anywhere once it is issued? There is an extension for that too.

This week I built three mints on devnet, each one testing a different extension. Below is what each one does, the exact command that created it, and when you would actually reach for it in a real product.

## Mint 1: Transfer Fee

Address: `2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf`

[View on Solana Explorer (devnet)](https://explorer.solana.com/address/2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf?cluster=devnet)

```
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  create-token \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 1000000 \
  --decimals 6
```

The Transfer Fee extension takes a cut of every single transfer and holds it on the recipient's own token account until someone with the withdraw authority claims it. I set mine to 100 basis points, which is 1 percent, with a maximum fee cap so high it never actually triggers in normal use. When I sent 1000 tokens to a test wallet, 10 tokens were withheld right there on the recipient's account, untouched until I ran a separate withdraw command to pull them back.

This is the extension you reach for when you want royalties on a creator token, a protocol fee baked into a stablecoin, or a small treasury skim on a community currency. The part that used to require a custom program, intercepting a transfer and rerouting a slice of it, is now a flag you pass at mint creation.

## Mint 2: Transfer Fee Stacked With Interest Bearing

Address: `HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B`

[View on Solana Explorer (devnet)](https://explorer.solana.com/address/HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B?cluster=devnet)

```
spl-token create-token \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --decimals 6 \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 1000000 \
  --interest-rate 5000
```

This mint combines two extensions on a single account. It still charges the same 1 percent transfer fee as above, and on top of that it carries an interest rate of 5000 basis points, an intentionally unrealistic 50 percent APR so the effect is visible in minutes instead of over a year.

Here is the part that is easy to get wrong if you only read the marketing. I checked my balance, waited thirty seconds, and checked it again. It went from `1000001.029892` to `1000001.505227` without me sending a single transaction. That number climbing is not new tokens being minted into my account. The raw balance stored on chain never changed. What changed is the UI amount, a value the client recalculates on the fly from the interest rate and the time elapsed, every time it is read. The interest bearing extension changes what gets displayed to you, not what actually exists in the account. If you are building anything that reads this number for accounting purposes, that distinction matters a lot.

## Mint 3: Non Transferable

Address: `EjpwYkvixRR4QsRjiHif4nESjBvjzJXWPUqnTph6vsV3`

[View on Solana Explorer (devnet)](https://explorer.solana.com/address/EjpwYkvixRR4QsRjiHif4nESjBvjzJXWPUqnTph6vsV3?cluster=devnet)

```
spl-token create-token --program-2022 --enable-non-transferable
```

This one does exactly what it sounds like. I minted a token to my own wallet, created a fully funded destination account for a second wallet, and tried to send it over. The transfer never had a chance:

```
Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb invoke [1]
Program log: Instruction: TransferChecked
Program log: Transfer is disabled for this mint
Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb failed: custom program error: 0x25
```

That rejection is not a wallet warning or a frontend guardrail you could bypass by calling the program directly. It comes from inside the Token 2022 program itself, so there is no path around it. That is exactly the property you want for a credential, a proof of attendance token, a membership badge, or any kind of soul bound achievement that should stay pinned to the wallet it was issued to.

## What Surprised Me

The interest bearing extension was the one that broke my assumptions. I expected the balance increase to mean new tokens were being minted on a timer, and it took reading the raw account data to realize the supply never moves, only the displayed amount does. That is the kind of detail you only really internalize by trying to break it yourself.

If I were building a real product, the transfer fee extension is the one I would reach for first. A protocol fee that the runtime enforces on every transfer, with no custom program and no way for a user to route around it, solves a problem that used to take real engineering effort. The non transferable extension is a close second for anything identity or credential shaped, since "the chain itself refuses to move this" is a much stronger guarantee than anything I could write in application logic.

Three mints, three extensions, zero custom programs. That is the whole pitch of Token 2022 in one week of terminal history.

---

Tags: `#100DaysOfSolana` `#solana` `#web3` `#tutorial`
