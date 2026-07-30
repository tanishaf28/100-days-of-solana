import { readFileSync } from "node:fs";
import ollama from "ollama";
import { web3 } from "@anchor-lang/core";
import { checkTransferPolicy, recordSpend } from "./policy.mjs";

const {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} = web3;


const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);


const wallet = Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(
      readFileSync("agent-wallet.json", "utf8")
    )
  )
);



// Tools
const tools = [
  {
    type: "function",
    function: {
      name: "get_balance",
      description:
        "Get the agent wallet balance in SOL",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },

  {
    type: "function",
    function: {
      name: "send_sol",
      description:
        "Send SOL to a Solana address. Transfers are limited to allowlisted recipients, 0.1 SOL per transfer, and 0.25 SOL per session.",
      parameters: {
        type: "object",
        properties: {
          recipient: {
            type: "string",
          },
          amount_sol: {
            type: "number",
          },
        },
        required: [
          "recipient",
          "amount_sol"
        ],
      },
    },
  },
];



async function runTool(name,args){

  if(name==="get_balance"){

    const balance =
      await connection.getBalance(
        wallet.publicKey
      );

    return {
      balance_sol:
        balance / LAMPORTS_PER_SOL
    };
  }


if(name==="send_sol"){

  const lamports =
    Math.round(
      Number(args.amount_sol) * LAMPORTS_PER_SOL
    );


  const decision =
    checkTransferPolicy(
      args.recipient,
      lamports
    );


  if(!decision.allowed){

    return {
      error:
      `Transfer blocked by policy: ${decision.reason}`
    };

  }


  const recipient =
    new PublicKey(args.recipient);


  const transaction =
    new Transaction().add(
      SystemProgram.transfer({

        fromPubkey:
        wallet.publicKey,

        toPubkey:
        recipient,

        lamports

      })
    );


  let signature;

  try {

    signature =
      await sendAndConfirmTransaction(
        connection,
        transaction,
        [wallet]
      );


  } catch(error){

    return {
      error:error.message
    };

  }


  recordSpend(lamports);


  return {

    signature,

    explorer:
    `https://explorer.solana.com/tx/${signature}?cluster=devnet`

  };

}

  return {
    error:"Unknown tool"
  };

}


const messages=[
{
 role:"system",
 content:
 `
You are a Solana devnet wallet agent.

You can check balance and send SOL.

Never claim a transaction happened unless the tool returns a signature.
`
},
{
 role:"user",
 content:process.argv[2]
}
];



while(true){

const response =
await ollama.chat({

model:"llama3.1",

messages,

tools,

});


const message=response.message;


messages.push(message);



if(!message.tool_calls){

console.log(
"\nAgent:",
message.content
);

break;

}



for(const call of message.tool_calls){

console.log(
"Tool:",
call.function.name,
call.function.arguments
);


const result =
await runTool(
call.function.name,
call.function.arguments
);


console.log(
"Result:",
result
);



messages.push({

role:"tool",

content:
JSON.stringify(result)

});


}


}
