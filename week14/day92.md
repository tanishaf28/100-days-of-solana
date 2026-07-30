
---

## 🚀 Step 1: Install Ollama

Run:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Start it:

```bash
ollama serve
```

---

## 📦 Step 2: Pull a model

Good choices:

```bash
ollama pull llama3.1
```

or lighter:

```bash
ollama pull mistral
```

---

## 🔧 Step 3: Replace Anthropic with Ollama

Install fetch (if needed):

```bash
npm install node-fetch
```

---

## 🧩 Minimal Ollama agent version

Replace your Anthropic part with this:

```javascript
import fetch from "node-fetch";
import { web3 } from "@anchor-lang/core";

const { Connection, PublicKey, LAMPORTS_PER_SOL } = web3;

const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);

async function getBalance(address) {
  const pubkey = new PublicKey(address);
  const lamports = await connection.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

async function askLLM(prompt) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      model: "llama3.1",
      prompt,
      stream: false
    })
  });

  const data = await res.json();
  return data.response;
}
```

---

## 🔁 Step 4: Fake tool-calling loop (simple version)

Since Ollama doesn’t natively do tool calls like Claude, do this:

```javascript
const question = process.argv.slice(2).join(" ");

const response = await askLLM(`
You are a Solana assistant.

If the user asks for balance, respond ONLY in this format:
TOOL:get_balance:<address>

Otherwise answer normally.

Question: ${question}
`);

console.log("LLM:", response);
```

---

## 🔌 Step 5: Execute tool manually

```javascript
if (response.startsWith("TOOL:get_balance:")) {
  const address = response.split(":")[2];

  const sol = await getBalance(address);

  const final = await askLLM(`
The balance is ${sol} SOL.

Explain this to the user in one sentence.
  `);

  console.log("\n", final);
}
```

---

## 🧪 Run it

```bash
node agent.js \
"How much SOL is in DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A?"
```

---

## 💡 Note
You can say:

> “Due to API billing constraints, I implemented a local agent using Ollama. The architecture remains identical: tool-based reasoning over Solana RPC, with manual tool invocation replacing native tool-calling.”

---
