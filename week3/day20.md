# I Built a CLI That Signs and Sends Real SOL, and Then I Made It Fail on Purpose

**Week 3 of #100DaysOfSolana: sharing the transfer tool instead of just explaining it.**

---

Yesterday I wrote about the anatomy of a Solana transaction: the message header, the 1,232 byte wall, the three commitment stages. All theory, dressed up in code snippets. Today the instruction was different: stop explaining the tool, show the tool.

So here it is.

## What I Actually Built

It's a small Node CLI, no more than a couple hundred lines, that takes a recipient address and an amount, and moves real SOL on devnet:

```bash
node transfer.mjs <RECIPIENT_ADDRESS> <AMOUNT_IN_SOL>
node transfer.mjs GrAkKfEpTKQuVHG2Y97Y2FF4i7y7Q5AHLK94JBy7Y5yv 0.1
```

Under the hood it does the same six things every Solana transfer does, just written out explicitly instead of hidden behind `solana transfer`:

```javascript
const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(sender, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) =>
    appendTransactionMessageInstruction(
      getTransferSolInstruction({
        source: sender,
        destination: recipientAddress,
        amount: transferLamports,
      }),
      tx
    )
);

const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
const signature = getSignatureFromTransaction(signedTransaction);
```

Load a keypair, check the balance, grab a fresh blockhash, build the instruction, sign, send, confirm. Every one of those steps is something I used to take for granted whenever I typed `solana transfer` into a terminal. Writing it by hand is what finally made each step stick.

## The Upgrade: Watching the Transaction Grow Up

The first version just fired the transaction and waited for one confirmation. The second version, the one I actually use now, reports every stage a transaction passes through on its way to being irreversible:

```javascript
statusUpdate("Status: Sending transaction...");
statusUpdate("Status: Processed (included in a block)...");
await waitForCommitment(rpc, signature, "confirmed");
statusUpdate("Status: Confirmed (supermajority voted)...");
await waitForCommitment(rpc, signature, "finalized");
statusUpdate("Status: Finalized (irreversible)");
```

Running it looks like this in the terminal:

```text
Solana Transfer Tool
====================

Connected to Solana devnet.

Sender: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
Recipient: DSA7f6jWCbm63EMoQac9wQ8Gj1QmgMLWtcd8P9cu1tzi
Amount: 0.1 SOL

Sender balance: 13.83 SOL

Sending 0.1 SOL to DSA7f6jWCbm63EMoQac9wQ8Gj1QmgMLWtcd8P9cu1tzi...

Status: Finalized (irreversible)

Transaction successful!
Signature: [YOUR_SIGNATURE_HERE]
View on Solana Explorer:
https://explorer.solana.com/tx/[YOUR_SIGNATURE_HERE]?cluster=devnet
```

Watching `processed` turn into `confirmed` turn into `finalized` in real time, instead of reading about it in documentation, is what made the commitment model click for me. Processed took under a second. Confirmed followed a few hundred milliseconds later. Finalized took another six to twelve seconds. That gap is not an accident, it's roughly 31 more blocks getting built on top before the network calls something irreversible.

## The Receipt

I have an earlier transfer from this same arc that still resolves on Solana Explorer, a plain 0.5 SOL send while I was first getting the recipient wallet set up:

Signature: `4YxDQXLpwHbuV9qF5gfU43hRqEKHc3CSuyCWRbnkWEc2cnrB6NoBbne62j7gFKi7BXr4o8AqEYJ3FNCZrJRUoqMW`

Explorer: https://explorer.solana.com/tx/4YxDQXLpwHbuV9qF5gfU43hRqEKHc3CSuyCWRbnkWEc2cnrB6NoBbne62j7gFKi7BXr4o8AqEYJ3FNCZrJRUoqMW?cluster=devnet

That's on-chain proof the tool works, not a screenshot I could have faked. Before posting, I'm running the tool one more time to get a fresh signature and a fresh terminal screenshot, since a receipt from a live run beats an old one.

## One Thing I Learned Building This

Building the failure case taught me more than building the happy path did. I wrote a second script that deliberately sends 500 SOL from a wallet that doesn't have it, with preflight simulation turned off so the rejection happens on-chain instead of locally:

```javascript
await rpc
  .sendTransaction(getBase64EncodedWireTransaction(signedTx), {
    skipPreflight: true,
    encoding: "base64",
  })
  .send();
```

The transaction still landed on-chain, still got a signature, and still cost a fee, even though it did nothing. That's not how a failed API call works. A failed POST doesn't bill you per attempt. A failed Solana transaction does, because validators still did the work of processing and rejecting it. Once I saw that with my own eyes on devnet, "failed transactions still cost fees" stopped being a line in the docs and became a thing I actually budget for.

## Try It Yourself

The whole tool is two files: one that sends and confirms, one that intentionally fails. If you're doing #100DaysOfSolana too, I'd genuinely like to see what your transfer tool looks like, especially if you built the failure case differently than I did.

---

*Week 3 of my #100DaysOfSolana journey. Sharing what I built, not just what I read about.*

`#100daysofsolana` `#solana` `#web3` `#blockchain`

---

## Ready-to-Post Version (X/Twitter)

> Built a CLI tool that transfers SOL on Solana's devnet, then built a second one that deliberately fails a transfer just to watch what happens.
>
> Biggest lesson: failed transactions still cost fees. Validators did the work, they get paid regardless. Nothing like a failed API call.
>
> [screenshot of terminal run]
> [Explorer link to your latest transaction]
>
> #100DaysOfSolana
