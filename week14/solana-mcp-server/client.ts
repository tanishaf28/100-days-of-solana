import ollama from "ollama";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";


const transport =
new StdioClientTransport({

 command:"npx",

 args:[
   "tsx",
   "server.ts"
 ]

});


const mcp =
new Client(
{
 name:"ollama-solana-client",
 version:"1.0"
},
{
 capabilities:{}
}
);



await mcp.connect(transport);



const tools =
await mcp.listTools();



console.log(
"Available tools:",
tools.tools.map(t=>t.name)
);



const response =
await ollama.chat({

model:"llama3.1",

messages:[

{
role:"system",

content:
`
You are a Solana assistant.

You have access to MCP tools.
Use tools whenever blockchain data is needed.
`
},


{
role:"user",

content:
process.argv[2]
}

],

tools:
tools.tools.map(tool=>({

type:"function",

function:{

name:tool.name,

description:tool.description,

parameters:
tool.inputSchema

}

}))

});



console.log(response.message);



if(response.message.tool_calls){


for(const call of response.message.tool_calls){


console.log(
"Calling:",
call.function.name
);



const result =
await mcp.callTool({

name:
call.function.name,


arguments:
call.function.arguments

});


console.log(
"Result:",
result
);



}


}