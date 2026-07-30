Yes. To make this **Ollama version**, replace the Anthropic API model with a **local Ollama model** (Llama 3.1, Qwen 2.5, Mistral, etc.). The architecture stays the same:

**Ollama = reasoning brain**
**Node.js code = wallet authority + policy enforcement**
**Solana wallet keypair = never exposed to Ollama**

Below is the rewritten version.

---

# Hand your Ollama agent a wallet and let it send SOL on devnet

Give your local AI agent a Solana wallet, allow it to check balances and send SOL, then enforce a hard spending limit in code.

The model decides **what it wants to do**.

Your program decides **what it is allowed to do**.

---

## The scenario

Yesterday your Solana agent could only read blockchain data.

Today it can act.

Someone asks:

> "Can my AI agent automatically pay contributor rewards?"

The dangerous approach is giving the AI your wallet private key.

The safer approach is the same pattern used in Web2:

* create a separate wallet for the agent
* fund it with limited SOL
* expose only controlled tools
* enforce spending limits in code

The AI can request a transfer, but the code decides whether that transfer is allowed.

---

# What you need

* Node.js 20+
* Ollama installed locally
* A local model (Llama 3.1, Qwen 2.5, Mistral)
* Solana devnet wallet
* Some devnet SOL

Install Ollama:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Download a model:

```bash
ollama pull llama3.1
```

Test:

```bash
ollama run llama3.1
```

---

# Create your project

```bash
mkdir ollama-solana-agent
cd ollama-solana-agent

npm init -y

npm install @solana/web3.js ollama
```

---

# Create the agent wallet

Create:

```
setup-wallet.mjs
```

```javascript
import { writeFileSync } from "node:fs";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";


const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);


const wallet = Keypair.generate();


writeFileSync(
  "agent-wallet.json",
  JSON.stringify(Array.from(wallet.secretKey))
);


console.log(
  "Agent wallet:",
  wallet.publicKey.toBase58()
);


try {

  const signature =
    await connection.requestAirdrop(
      wallet.publicKey,
      2 * LAMPORTS_PER_SOL
    );


  const latest =
    await connection.getLatestBlockhash();


  await connection.confirmTransaction({
    signature,
    ...latest
  });


  const balance =
    await connection.getBalance(wallet.publicKey);


  console.log(
    "Balance:",
    balance / LAMPORTS_PER_SOL,
    "SOL"
  );


}

catch(error){

  console.log(
    "Airdrop failed:",
    error.message
  );


  console.log(
    "Use faucet:",
    "https://faucet.solana.com"
  );

}
```

Run:

```bash
node setup-wallet.mjs
```

You should see:

```
Agent wallet:
8xK....abc

Balance:
2 SOL
```

---

# Create the Ollama Solana agent

Create:

```
agent.mjs
```

```javascript
import { readFileSync } from "node:fs";
import ollama from "ollama";

import {
 Connection,
 Keypair,
 PublicKey,
 SystemProgram,
 Transaction,
 sendAndConfirmTransaction,
 LAMPORTS_PER_SOL
} from "@solana/web3.js";



const connection =
new Connection(
 "https://api.devnet.solana.com",
 "confirmed"
);



const wallet =
Keypair.fromSecretKey(
 Uint8Array.from(
  JSON.parse(
   readFileSync(
    "agent-wallet.json",
    "utf8"
   )
  )
 )
);



//
// POLICY ENFORCEMENT
// The model cannot override this.
//
const MAX_SOL_PER_SEND = 0.1;



async function getBalance(){

 const balance =
 await connection.getBalance(
  wallet.publicKey
 );


 return {
  balance_sol:
   balance / LAMPORTS_PER_SOL
 };

}



async function sendSol(input){


 if(input.amount_sol > MAX_SOL_PER_SEND){

  return {

   error:
   `Rejected by policy.
   Maximum allowed transfer is
   ${MAX_SOL_PER_SEND} SOL.`

  };

 }



 let recipient;


 try {

  recipient =
   new PublicKey(
    input.recipient
   );

 }

 catch {

  return {
   error:
   "Invalid Solana address"
  };

 }



 const transaction =
 new Transaction()
 .add(

  SystemProgram.transfer({

   fromPubkey:
    wallet.publicKey,

   toPubkey:
    recipient,

   lamports:
    Math.round(
     input.amount_sol *
     LAMPORTS_PER_SOL
    )

  })

 );



 try {


 const signature =
 await sendAndConfirmTransaction(
  connection,
  transaction,
  [wallet]
 );


 return {

  signature,

  explorer:
  `https://explorer.solana.com/tx/${signature}?cluster=devnet`

 };


 }

 catch(error){

  return {
   error:
    error.message
  };

 }


}




const tools = {

 get_balance:
 getBalance,

 send_sol:
 sendSol

};



const prompt =
process.argv[2];



const response =
await ollama.chat({

 model:"llama3.1",

 messages:[

 {

 role:"system",

 content:
 `
You are a Solana wallet agent.

You can:
- check wallet balance
- send SOL

Never pretend a transaction happened.
Always explain policy failures.
`

 },

 {

 role:"user",

 content:prompt

 }

 ],


 tools:[

 {

 type:"function",

 function:{

 name:"get_balance",

 description:
 "Get wallet balance",

 parameters:{
 type:"object",
 properties:{}
 }

 }

 },


 {

 type:"function",

 function:{

 name:"send_sol",

 description:
 "Send SOL from agent wallet",

 parameters:{

 type:"object",

 properties:{

 recipient:{
 type:"string"
 },

 amount_sol:{
 type:"number"
 }

 },

 required:[
 "recipient",
 "amount_sol"
 ]

 }

 }

 }

 ]

});


console.log(response.message.content);
```

---

# Run the agent

First check wallet:

```bash
node agent.mjs "Check your wallet balance"
```

Example:

```
Agent:
Your wallet contains 2 SOL.
```

---

Send SOL:

Replace with your wallet address:

```bash
node agent.mjs \
"Send 0.05 SOL to YOUR_WALLET_ADDRESS"
```

The flow:

```
User
 |
 v
Ollama
 |
 decides:
 "call send_sol"
 |
 v
Node.js tool
 |
 checks:
 amount <= 0.1 SOL?
 |
 v
Solana transaction
 |
 v
Devnet
```

---

# Test the policy guardrail

Try:

```bash
node agent.mjs \
"Send 1 SOL to YOUR_WALLET_ADDRESS"
```

Ollama may decide:

```
I will send 1 SOL
```

But your code stops it:

```
Rejected by policy.
Maximum allowed transfer is 0.1 SOL.
```

The model does not control the wallet.

Your code does.

---

# What changed from Claude version?

| Claude version           | Ollama version       |
| ------------------------ | -------------------- |
| Anthropic API            | Local Ollama server  |
| `@anthropic-ai/sdk`      | `ollama` npm package |
| Claude tool calling      | Ollama tool calling  |
| API key required         | No API key           |
| Cloud model              | Local model          |
| Same Solana wallet logic | Same                 |

---

# Why this design matters

The important separation:

```
AI decides
      |
      v
Tool layer validates
      |
      v
Wallet signs
      |
      v
Blockchain executes
```

The private key never enters Ollama.

The model only sees:

* available tools
* user request
* tool results

The wallet stays inside your application.

This is the same pattern used for production AI agents that interact with money, APIs, and infrastructure.
