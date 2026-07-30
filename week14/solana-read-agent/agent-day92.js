import fetch from "node-fetch";
import { web3 } from "@coral-xyz/anchor";

const { Connection, PublicKey, LAMPORTS_PER_SOL } = web3;

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// --------------------
// Tools
// --------------------
async function runTool(name, input) {
  try {
    const pubkey = new PublicKey(input.address);

    if (name === "get_balance") {
      const lamports = await connection.getBalance(pubkey);
      return {
        lamports,
        sol: lamports / LAMPORTS_PER_SOL,
      };
    }

    if (name === "get_account_info") {
      const info = await connection.getAccountInfo(pubkey);

      if (!info) return { exists: false };

      return {
        exists: true,
        owner: info.owner.toBase58(),
        lamports: info.lamports,
        executable: info.executable,
        dataLength: info.data.length,
      };
    }

    return { error: "Unknown tool" };
  } catch (err) {
    return { error: err.message };
  }
}

// --------------------
// Ollama call
// --------------------
async function askLLM(prompt) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1",
      prompt,
      stream: false,
    }),
  });

  const data = await res.json();
  return data.response.trim();
}

// --------------------
// Parse decision robustly
// --------------------
function parseToolCall(text) {
  text = text.trim();

  // 1. Match TOOL format FIRST (only first occurrence)
  const toolMatch = text.match(/TOOL:(get_balance|get_account_info):([A-Za-z0-9]+)/);
  if (toolMatch) {
    return {
      tool: toolMatch[1],
      address: toolMatch[2],
    };
  }

  // 2. Match function format: get_balance(...)
  const fnMatch = text.match(/(get_balance|get_account_info)\(([A-Za-z0-9]+)\)/);
  if (fnMatch) {
    return {
      tool: fnMatch[1],
      address: fnMatch[2],
    };
  }

  return null;
}

// --------------------
// Agent
// --------------------
const question =
  process.argv.slice(2).join(" ") ||
  "What is the SOL balance of DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A?";

async function main() {
  const decision = await askLLM(`
You are a strict API router.

TOOLS:
- get_balance(address)
- get_account_info(address)

RULES:
- Respond ONLY with one of these formats:
  TOOL:get_balance:<address>
  TOOL:get_account_info:<address>
- NO explanations
- NO extra text
- NO punctuation outside format

User question:
${question}
`);

  console.log("LLM decision:", decision);

  const parsed = parseToolCall(decision);

  if (!parsed) {
    console.log("\nFallback answer:\n", decision);
    return;
  }

  const { tool, address } = parsed;

  if (!address) {
    console.log("Failed to extract address");
    return;
  }

  console.log(`[tool] ${tool}(${address})`);

  const result = await runTool(tool, { address });

  const final = await askLLM(`
You are a Solana assistant.

Tool result:
${JSON.stringify(result)}

Explain clearly in 1 short sentence.
`);

  console.log("\n", final);
}

main();