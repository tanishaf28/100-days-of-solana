
# Solana Transactions Are Not API Calls (But They Kind of Are)
**Week 3 of #100DaysOfSolana: on anatomy, failures, fees, and why I now read error logs differently.**

---

I've been staring at HTTP request anatomy for years. Headers, body, method, auth token. When someone told me a Solana transaction has a similar structure, I nodded politely and assumed I'd get it quickly.

I did not get it quickly.

Here's what I understand now that I didn't at the start of this arc.

---

## The Structure That Surprised Me

A Solana transaction has two parts: **signatures** and a **message**. Simple enough. But the message has a header that does something I hadn't seen before three single-byte numbers that partition the account keys array into permission groups:

- How many signatures are required
- How many signing accounts are read-only
- How many non-signing accounts are read-only

That's it. Three numbers, and the runtime knows the entire permission structure for every account in the transaction. No per-account metadata flags. No separate auth table. The ordering of accounts in the array *is* the access control.

When I ran `solana confirm -v` on my first transfer and actually read through the output, this was the part I had to re-read three times. The account keys list isn't just a list of addresses its *position* carries meaning.

```plaintext
Account Keys:
  [0] Writable, Signer, Fee Payer  → your wallet
  [1] Writable                     → recipient
  [2] Read-only                    → System Program
```

It's a positional encoding of permissions. Elegant, and also deeply non-obvious the first time.

---

## The 1,232-Byte Wall

Every serialized Solana transaction must fit in 1,232 bytes. This comes from the IPv6 minimum MTU (1,280 bytes) minus 48 bytes of network headers. It is the tightest constraint I've hit so far in this challenge.

Each account key is 32 bytes. A transaction with 10 unique accounts is already using 320 bytes just on addresses. Add a signature (64 bytes), a recent blockhash (32 bytes), instruction headers, and actual instruction data, and you run out of space faster than you'd expect.

This is why Address Lookup Tables exist they let you reference on-chain tables of addresses using 1-byte indexes instead of 32-byte keys. I haven't built with them yet, but now I understand *why they exist*. That feels like progress.

---

## Failed Transactions Are the Most Useful Thing I Did All Week

Day 19 was "explore failed transactions on purpose" and honestly it should have been day 1.

Here's the thing I didn't know before: **failed transactions still cost fees.** The network processed your transaction. Validators did the work. They get paid regardless.

This is completely unlike a failed HTTP request. If your API call errors out, you don't get billed per attempt. On Solana, every failed transaction is real lamports gone. The economics of error handling are different.

When I ran `solana confirm -v` on a deliberately-failed transfer, I saw:

```plaintext
Status: Error: InstructionError(0, Custom(1))
Fee: 5000 lamports charged
Compute Units: 3436 consumed before failure
```

That 5000 lamports is gone. And the balance changes still show up  the fee payer lost lamports even though the transfer did nothing.

Production Solana apps use **preflight simulation** to catch failures before submitting. It's the blockchain equivalent of validating a form before POSTing it to your server. I understand that pattern now in a way I couldn't have without watching money disappear on devnet.

---

## The Commitment Model is Not Binary

When you send a transaction on Solana, it doesn't go "pending" → "done." It moves through three stages:

**Processed** a validator included it in a block. Like your POST reaching the server.

**Confirmed** 66%+ of validators voted on the block. Like getting a 200 OK from a properly load-balanced API. In Solana's entire history, no confirmed transaction has ever been reversed.

**Finalized** 31+ more confirmed blocks have been built on top. Irreversible by any reasonable threat model.

I added real-time confirmation tracking to my CLI transfer tool on Day 18 — breaking out the stages and reporting each one as it happened. On devnet, processed → confirmed takes about 400ms. Confirmed → finalized takes 6-12 seconds. Watching it happen in the terminal made the whole model concrete in a way reading the docs didn't.

---

## The Web2 Comparison That Actually Holds (and Where It Breaks)

Solana transaction ↔ HTTP request mapping:

| Solana | HTTP |
|---|---|
| Message header | Request headers (metadata, permissions) |
| Account keys | URL paths + query params (resources) |
| Instructions | Request body (operations) |
| Signatures | Auth tokens (proof of authorization) |
| Recent blockhash | CSRF token with expiry (~60-90 seconds) |

The analogy holds pretty well until you hit atomicity. HTTP requests are processed by one server. If the server errors mid-request, partial state changes can persist. Solana transactions are atomic across all instructions — if any instruction fails, all of them roll back. And the transaction is validated by every validator in the network independently before anything changes.

Oh, and if your recent blockhash expires (~150 slots, roughly 60-90 seconds after the block it references), your transaction is dead. You'd need to rebuild it with a fresh blockhash. There's no such thing as "my API call timing out and retrying with the same request", a retry here is a new transaction.

---

## What Week 3 Left Me With

I came into this arc thinking transactions were "the thing you do to move tokens." I'm leaving it understanding that they're signed, atomic, time-bounded, fee-always-charged state transitions with a 1,232-byte budget and a positional permission model.

That's a lot more interesting than "the thing you do to move tokens."

Week 4 is tokens. I'll be back.

---

*Week 3 of my #100DaysOfSolana journey. Writing about what I'm learning so I actually learn it.*

`#100daysofsolana` `#solana` `#web3` `#blockchain`