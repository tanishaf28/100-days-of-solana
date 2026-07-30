# I Queried a Blockchain Like a Database and It Kind of Broke My Brain

**Week 2 of #100DaysOfSolana: on reading public data, comparing accounts to tables, and the moment the "everything is public" thing got real.**

---

Let me tell you about the exact moment week 2 of this challenge stopped feeling theoretical.

I had just written my first `getBalance()` call. Simple stuff paste an address, get a number back. And then I thought: what if I paste *someone else's* address?

So I did. I pasted the Token-2022 program address (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`) into my script. Same code, different address. And it just... worked. No API key. No authentication. No `403 Forbidden`. Full balance, full transaction history, returned immediately.

That's when the "Solana is a public database" framing stopped being a metaphor and started being a fact I could feel.

---

## What I Actually Built This Week

Week 2 was the **Reading the Blockchain** arc. Seven days of querying data, building UIs around it, and then staring at the account model until it made sense.

**Days 8–9: Reading balances and transaction history**

The RPC pattern is genuinely familiar if you've worked with any REST API:

```js
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const { value: balance } = await rpc.getBalance(targetAddress).send();
```

That's it. That's the whole thing. `getBalance` returns lamports, you divide by `1_000_000_000`, you're done. `getSignaturesForAddress` is just as clean, you get back a list of transaction signatures with slots, timestamps, and status. Felt immediately comfortable coming from a REST background.

**Day 10: Moving it to the browser**

Same SDK, same calls, just inside a Vite project instead of a Node script. The `@solana/kit` package bundles fine for the browser, Vite handles it. The interesting part was error handling  in a terminal script you can let an error crash and read the stack trace. In a web app, you're catching bad addresses and network failures and actually telling the user something useful.

**Day 11: Accounts vs. databases: the comparison that changed how I think**

This was the one that took the longest to sit with. I built a comparison table. Here's the short version of what surprised me most:

| Thing I assumed | How it actually works |
|---|---|
| "Storage costs are in my hosting bill" | You deposit lamports proportional to bytes stored. It's refundable. It's *per record*. |
| "Access control is my app's job" | The runtime enforces it. Only the owning program can modify an account. |
| "Data is private by default" | Everything is public by default. Opt-out doesn't exist at the protocol level. |
| "Code and data are separate systems" | Both live in the account model. Programs are just accounts with `executable: true`. |

That last one genuinely surprised me. When I ran `solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` and saw `executable: true` and a BPF Loader as the owner, I had to sit with it for a minute. The thing that *runs* your code and the thing that *stores* your data are the same kind of object, just with different contents.

**Days 12: Devnet vs. mainnet**

Two RPC connections, one URL difference:

```js
const devnetRpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const mainnetRpc = createSolanaRpc(mainnet("https://api.mainnet-beta.solana.com"));
```

Same queries, completely different data. Different balances, different transaction histories, different activity. It's what I'd expect from staging vs. production databases : same schema, separate state — except here "staging" is a whole separate validator network, not a different database on the same server. And the type system in `@solana/kit` enforces this: you can't accidentally pass a devnet RPC where a mainnet one is expected. That's actually a nice developer ergonomics detail.

---

## The Thing That Still Feels Weird

There are no JOINs. There's no server-side filtering.

In a traditional database, I write a query, the server processes it, and I get back exactly the rows I asked for. On Solana, programs receive accounts as *inputs to instructions*. If I want to filter or combine data, I do that off-chain via RPC and assemble results myself.

Coming from SQL, this feels backwards. But I think I'm starting to understand why it has to be this way: when thousands of validators are independently processing transactions, you can't have them running arbitrary compute-heavy queries. You need deterministic, bounded operations. The query layer is the developer's problem. The blockchain's job is to execute and record.

It's a constraint that's also the entire point.

---

## What's Next

Week 3 is transactions actually *writing* state changes instead of reading them. I've been querying this global database for a week. Now I get to write to it.

If you're doing #100DaysOfSolana: what was the hardest mental model shift in week 2 for you? For me it was definitely the rent model: the idea that storage cost is attached to the record itself, not abstracted into infrastructure pricing. Still wrapping my head around the implications.

---

*Week 2 of my #100DaysOfSolana journey. Building in public, one day at a time.*

`#100daysofsolana` `#solana` `#web3` `#blockchain`