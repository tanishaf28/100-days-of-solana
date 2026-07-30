---
title: "The Missing Manual for My Ollama-Powered Solana Agent"
published: true
tags: solana, ai, mcp, webdev
---

Could a teammate rebuild this agent stack using nothing but what I've written down? A week ago, honestly, no. Over five days I put together something genuinely sophisticated: a local agent loop running on Ollama instead of a cloud API, a transfer tool with a hardcoded spending cap, an MCP server that turns those tools into something any AI client can discover, a policy engine that separates "the model decided" from "the code allowed," and an autonomous run where the whole thing pursued a goal on its own across multiple turns. Every design decision that makes it work has lived in one place: my head. This post is that decision getting written down.

## Take inventory

| Component | Lives in | Built on | Job in one sentence |
|---|---|---|---|
| Agent loop | `agent.mjs` (`solana-read-agent`) | Day 92 | Turns a plain-English request into a tool call, using a local Ollama model instead of a cloud API key |
| Balance tool | `get_balance()` / `get_wallet_balance` (MCP) | Day 92 | Reads a wallet's SOL balance from devnet; read-only, can't move funds |
| Transfer tool | `send_sol()` (Day 93), later `transfer_sol` in the autonomous workflow (Day 96) | Day 93 | Builds and submits a `SystemProgram.transfer`, gated by a hardcoded per-transfer SOL cap |
| MCP server | `server.ts` (`solana-ollama-mcp`) | Day 94 | Wraps the same tools, plus a vault-specific `initialize_vault`, behind the Model Context Protocol so any MCP-aware client can discover and call them, not just one script |
| Policy engine | `policy.mjs` | Day 95 | Separates "is this allowed" from the model's reasoning entirely: allowlisted recipients, a per-transfer cap, a per-session cap, deny by default |

## Draw the flow

```
your goal, in plain English
        |
        v
+----------------------+
|  Ollama (local LLM)  |  decides which tool to call next
+----------------------+
        |
        v  tool call, e.g. transfer_sol / send_sol
+----------------------+
|  MCP server or       |  exposes tools to any client
|  agent tool-loop     |  (Day 92-93 called tools directly;
+----------------------+   Day 94 moved this behind MCP)
        |
        v
+----------------------+
|  policy.mjs          |  deny by default; every spend checked
+----------------------+
        |  allowed
        v
+----------------------+
|  Solana devnet       |  transaction submitted and confirmed
+----------------------+
```

The private key never enters Ollama at any point in this chain. The model only ever sees tool names, descriptions, and results; the wallet keypair stays inside the Node.js process the whole time.

## Tool reference

### Tool: `get_balance` / `get_wallet_balance`

- **Inputs:** none (reads the agent's own configured wallet)
- **Returns:** `{ balance_sol: number }`, or a formatted "`<address>` has `X` SOL" string over MCP
- **Side effects:** none
- **Guarded by policy:** not applicable, read-only

### Tool: `send_sol` (direct tool-call version, Day 93)

- **Inputs:** `recipient` (string), `amount_sol` (number)
- **Returns:** `{ signature, explorer }` on success, or `{ error }`
- **Side effects:** spends SOL from the agent wallet
- **Guarded by policy:** yes, a hardcoded `MAX_SOL_PER_SEND = 0.1` check inside the tool itself at this stage (the check didn't move into a separate module until Day 95)

### Tool: `initialize_vault` (MCP version, Day 94)

- **Inputs:** `amountSol` (number)
- **Returns:** a text block confirming the vault was created with a transaction signature, an "already exists" notice, or a rejection
- **Side effects:** deposits SOL into a program-derived vault account via an Anchor `deposit` instruction
- **Guarded by policy:** yes, a `MAX_SOL = 0.1` check inside the MCP tool handler, same shape as Day 93's cap, just moved behind the protocol boundary

### Tool: `transfer_sol` (autonomous workflow version, Day 96)

- **Inputs:** `to` (address), `lamports` (integer)
- **Returns:** `{ status: "confirmed", signature, amountSol }` or `{ status: "denied", reason }`
- **Side effects:** spends SOL from the operating wallet
- **Guarded by policy:** yes, routed through `policy.mjs`'s `checkTransferPolicy` before anything is signed

## Document the policy layer

This is the part of the stack that actually makes it safe, so it gets written down rule by rule. `policy.mjs` runs a fixed sequence of checks before any transfer is allowed:

1. **Is the recipient allowlisted?** The address is parsed as a `PublicKey` first; a malformed address is rejected before anything else runs. Then it's checked against a hardcoded `Set` of allowed recipients. Anything not on the list is denied, full stop, regardless of amount.
2. **Is the amount a positive integer number of lamports?** Zero, negative, or non-integer values are rejected.
3. **Is the transfer within the per-transaction cap?** In the original `policy.mjs`, that cap was `0.1 SOL`. By the time the autonomous run happened on Day 96, the operative cap had been tightened to `0.05 SOL`, and every log below reflects that tighter number, not the original 0.1.
4. **Is the running session total still within the session cap** (`0.25 SOL` in the original policy)? A transfer that's individually small enough can still be denied if it would push the session's cumulative spend over the limit.
5. **If none of the above reject it, approve, and record the spend.**

The default when no rule explicitly approves a request is **deny**. There is no path through this code where a transfer succeeds because a check was silently skipped.

The core invariant, stated plainly: the prompt can change, the model can change, the exact sequence of tool calls can change, but no transaction moves funds without passing through `checkTransferPolicy` first. A denial from this layer looks identical to the model whether the model itself asked to send too much, or whether a piece of injected text tried to talk it into sending too much. The policy doesn't ask why the request was made; it only checks whether the request is allowed.

## Annotate a real run

This is one real run of the Day 96 autonomous workflow (`agent-workflow-ollama.mjs`), reading two wallets and moving SOL between them on its own:

```
turn 1
tool_call { index: 0, name: 'get_balance', arguments: { address: 'EQb98...t67K' } }
tool_result { address: 'EQb98...t67K', lamports: 4309970000, sol: 4.30997 }
```
> The agent checks the operating wallet's balance first, unprompted, before deciding anything.

```
tool_call { index: 1, name: 'get_balance', arguments: { address: '7aPJz...ooT7' } }
tool_result { address: '7aPJz...ooT7', lamports: 600000000, sol: 0.6 }
```
> Then the savings wallet, so it has both numbers before reasoning about a transfer.

```
tool_call {
  index: 2,
  name: 'transfer_sol',
  arguments: { to: '7aPJz...ooT7', lamports: 200000000 }
}
policy_check {
  to: '7aPJz...ooT7', lamports: 200000000, allowed: true, reason: 'Approved'
}
tool_result {
  status: 'confirmed',
  signature: '42GaSs5JxwRrjUfnM64UuRhVEsj9YKVdZqNKECTG4fmjuKZaXoY6kvtDsbz6mPbBMa5Qd4ypAC4YvLnNmEsC9kxH',
  amountSol: 0.2
}
```
> A 0.2 SOL transfer, under the 0.25 SOL session cap in effect for this particular run, passes the policy check and actually lands on devnet with a real signature.

And a denial from a separate run in the same session, which is the more convincing evidence that the guardrail actually holds:

```
tool_call {
  index: 2,
  name: 'transfer_sol',
  arguments: { lamports: '400000000', to: '7aPJz...ooT7' }
}
policy_check {
  lamports: 400000000, to: '7aPJz...ooT7', allowed: false,
  reason: 'Transfer exceeds limit of 0.05 SOL'
}
tool_result { status: 'denied', reason: 'Transfer exceeds limit of 0.05 SOL' }
```
> The model decided to move 0.4 SOL to cover a shortfall it had calculated. The policy layer rejected it before a signature was ever produced, purely on the size of the number, with no awareness of why the model wanted to send it.

## Lessons learned

- **Non-determinism showed up in the reasoning, not just the tool calls.** Across nearly identical runs (same two wallet balances, same goal), the final natural-language report varied: one run correctly said "the required transfer is 4.2 SOL, but policy prevents transfers larger than 0.05 SOL," another miscalculated the missing amount as `0.30997 - 0.2 = 0.10997 SOL` for no clear reason, and one run's "final report" was just a raw, unexecuted tool-call JSON blob (`{"name":"transfer","parameters":{...}}`) instead of a sentence. The tool calls that actually touched the chain were consistent; the commentary around them was not.
- **The policy held in every run regardless of what the model tried.** Whether the model asked for 0.4 SOL or 5 SOL, in every single log the transfer was denied before signing, and the agent reported the denial honestly rather than pretending the transfer happened.
- **Ollama's native tool-calling was good enough by Day 93 that the Day 92 manual `TOOL:get_balance:<address>` string-parsing workaround turned out to be unnecessary.** The early assumption was "Ollama doesn't do tool calls like Claude," but the `ollama` npm package's `tools` parameter worked directly once wired up correctly.
- **Moving the same guardrail behind MCP on Day 94 didn't weaken it.** The `initialize_vault` MCP tool enforces the identical `MAX_SOL` check the direct-call version had, which is the actual point of putting a policy in the tool layer instead of the prompt: the boundary survives a change in how the tool gets called.
- **What I'd harden before this touches anything beyond devnet:** the allowlist and both caps are hardcoded constants in a file, not something the agent (or an operator) can inspect or change safely at runtime; there's no persistent record of session spend across process restarts, so a restarted agent gets a fresh session cap for free; and the "unknown tool-call-shaped text instead of a real call" failure mode seen in the reasoning logs needs its own explicit handling, the same way a disconnected wallet needed its own branch in an earlier arc.

## Resources

- [Model Context Protocol docs](https://modelcontextprotocol.io/), for the client/server split behind Day 94
- [Ollama's tool-calling docs](https://ollama.com), for the `tools` parameter used from Day 93 onward
- [Solana System Program docs](https://solana.com/docs/core/transactions), for the transfer instruction every tool here eventually calls

*Written as part of #100DaysOfSolana.*
