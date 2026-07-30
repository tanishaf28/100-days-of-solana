import ollama from "ollama";
import fs from "fs";
import { web3 } from "@anchor-lang/core";


const {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} = web3;



const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);



function loadWallet(path){

  return Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(
        fs.readFileSync(path, "utf8")
      )
    )
  );

}



const operating =
loadWallet("agent-wallet.json");


const savings =
loadWallet("savings-wallet.json");

const GOAL =
`
The savings wallet must hold at least 5 SOL.

First:
1. Check the operating wallet balance.
2. Check the savings wallet balance.

Then:
3. Calculate exactly how much SOL is missing.
4. Attempt one transfer only if it is allowed by policy.
5. Verify the savings wallet balance after the transfer.

If policy prevents the transfer, stop and report the denial.
`;



const POLICY = {

  allowedRecipients:[
    savings.publicKey.toBase58()
  ],

  maxLamportsPerTransfer:
    0.05 * LAMPORTS_PER_SOL,


  maxLamportsPerRun:
    0.5 * LAMPORTS_PER_SOL

};



let spentThisRun = 0;



function checkPolicy(to, lamports){


  if(
    !POLICY.allowedRecipients.includes(to)
  ){

    return {
      allowed:false,
      reason:"Recipient not allowlisted"
    };

  }



  if(
    lamports > POLICY.maxLamportsPerTransfer
  ){

    return {
      allowed:false,
      reason:
      `Transfer exceeds limit of ${
        POLICY.maxLamportsPerTransfer / LAMPORTS_PER_SOL
      } SOL`
    };

  }



  if(
    spentThisRun + lamports >
    POLICY.maxLamportsPerRun
  ){

    return {
      allowed:false,
      reason:"Session spending limit exceeded"
    };

  }



  return {
    allowed:true,
    reason:"Approved"
  };

}



const log=[];



function record(event,data){

  const entry={
    event,
    data
  };

  log.push(entry);

  console.log(
    event,
    data
  );

}




const tools=[


{
type:"function",

function:{

name:"get_balance",

description:
"Get the balance of a Solana devnet wallet. Returns lamports and SOL.",

parameters:{

type:"object",

properties:{

address:{
type:"string",
description:"Solana wallet address"
}

},

required:[
"address"
]

}

}

},



{
type:"function",

function:{

name:"transfer_sol",

description:
`
Transfer SOL from the operating wallet to the savings wallet.

Rules:
- Only the savings wallet can receive funds.
- Policy checks happen before signing.
- Never bypass policy.
`,

parameters:{

type:"object",

properties:{

to:{
type:"string"
},

lamports:{
type:"number",
description:"Amount in lamports"
}

},

required:[
"to",
"lamports"
]

}

}

}

];






async function runTool(name,args){



if(name==="get_balance"){


try{


const address =
new PublicKey(args.address);



const lamports =
await connection.getBalance(address);



return {

address:
args.address,

lamports,

sol:
lamports / LAMPORTS_PER_SOL

};


}

catch(error){

return {
error:"Invalid wallet address"
};

}


}






if(name==="transfer_sol"){



const lamports =
Number(args.lamports);



const decision =
checkPolicy(
args.to,
lamports
);



record(
"policy_check",
{
...args,
lamports,
...decision
}
);



if(!decision.allowed){

return {

status:"denied",

reason:
decision.reason

};

}





const tx =
new Transaction().add(

SystemProgram.transfer({

fromPubkey:
operating.publicKey,


toPubkey:
new PublicKey(args.to),


lamports

})

);




try{


const signature =
await sendAndConfirmTransaction(
connection,
tx,
[operating]
);



spentThisRun += lamports;



return {

status:"confirmed",

signature,

amountSol:
lamports / LAMPORTS_PER_SOL

};


}

catch(error){


return {

status:"failed",

reason:error.message

};


}


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
You are a Solana devnet wallet workflow agent.
The current GOAL message is the only task.
Ignore previous runs and previous examples.
Never use old target amounts.
Only act using the current wallet balances and policy.

Wallet roles:

Operating wallet:
${operating.publicKey.toBase58()}

Savings wallet:
${savings.publicKey.toBase58()}


Rules:

1. The operating wallet sends SOL.
2. The savings wallet receives SOL.
3. Never send SOL from savings.
4. Always check both balances before transfers.
5. Calculate the exact missing amount before transferring.
6. Never transfer more than required.
7. Tool balances are in lamports and SOL.
8. 1 SOL = 1,000,000,000 lamports.
9. Never claim a transaction happened without a real signature.
10. Tool results are the only source of truth.
11. If policy blocks an action, do not retry with another transfer amount. Stop immediately and explain why.
12. Never invent signatures, balances, or blockchain results.
`

},


{
role:"user",
content:GOAL
}

];






const MAX_TURNS=12;



for(
let turn=1;
turn<=MAX_TURNS;
turn++
){



record(
"turn",
turn
);



const response =
await ollama.chat({

model:"llama3.1",

messages,

tools

});



const msg =
response.message;



messages.push(msg);




if(!msg.tool_calls){


record(
"final_report",
msg.content
);


break;


}





for(
const call of msg.tool_calls
){



record(
"tool_call",
call.function
);



const result =
await runTool(
call.function.name,
call.function.arguments
);



record(
"tool_result",
result
);




messages.push({

role:"tool",

content:
JSON.stringify(result)

});



}



}






fs.writeFileSync(
"run-log.json",
JSON.stringify(log,null,2)
);



console.log(
"Saved run-log.json"
);