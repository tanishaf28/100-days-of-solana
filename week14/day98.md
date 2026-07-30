# Day 98: Amplify, sharing the autonomous agent run (as a post, not a video)

Writing this as a text post rather than a screen recording, since the whole stack runs on a local Ollama model with no polished UI to point a camera at. The story the video would have told, goal in, tool calls in the middle, policy check, confirmed result, works just as well pasted straight from the real Day 96 terminal output. Same "approval and denial side by side" thesis, just as text.

**1/ Hook**
```
Here's my AI agent moving SOL on devnet, on its own, with the receipts.
```

**2/ The goal**
```
One instruction: "check both wallets, top up savings if it's short."
No script telling it which tool to call or in which order, just an
Ollama model reading two balances and deciding what to do next.
```

**3/ The approval**
```
tool_call get_balance (operating): 4.30997 SOL
tool_call get_balance (savings): 0.6 SOL
tool_call transfer_sol { to: savings, lamports: 200000000 }
policy_check { allowed: true, reason: 'Approved' }
tool_result { status: 'confirmed', signature: '42GaSs5J...' }

0.2 SOL moved, real signature, verifiable on Explorer (devnet).
```

**4/ The denial**
```
Same agent, same wallet, asked to move more:

policy_check { allowed: false, reason: 'Transfer exceeds limit of 0.05 SOL' }
tool_result { status: 'denied', reason: 'Transfer exceeds limit of 0.05 SOL' }

This is the part that actually matters. Anyone can wire a model to a
wallet. The valuable part is the layer that says no.
```

**5/ Closing**
```
Full write-up on the whole stack (agent loop, MCP server, policy
engine): https://dev.to/tanisha_fonseca/he-missing-manual-for-my-ollama-powered-solana-agent-2dp

#100DaysOfSolana
```
