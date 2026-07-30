The challenge
What you’ll need
Your vault program, deployed to devnet earlier in this arc, with its source still on your machine
Anchor CLI 1.0.2 and the Solana CLI, both already installed from earlier days
A Solana wallet keypair with a small amount of devnet SOL (run solana airdrop 2 --url devnet if your balance is low). Publishing the IDL pays rent for a new account, so you will do this on devnet where SOL is free
The same dedicated devnet RPC endpoint from Day 86 (solana config set --url "[your-endpoint]", quoted), so anchor idl init publishes reliably rather than stalling on the public RPC
Node.js 18 or newer and a terminal in your project root
Your program’s ID. Find it any time with anchor keys list
Steps
Rebuild to get a fresh IDL. Run anchor build. This compiles your program and writes the IDL to target/idl/vault.json. Open that file and read it. You will recognize your instruction names (deposit, withdraw), your accounts struct fields, and your custom error codes, all expressed as plain JSON. The commands below use vault; swap it for your program’s name if you chose a different one.
Confirm where your program lives. The IDL must be published to the same cluster as the program it describes. For this challenge you will publish to devnet. Make sure your program is deployed there with solana program show [PROGRAM_ID] --url devnet. If it returns program details, you are ready.
Publish the IDL on-chain. Use anchor idl init with the -f flag pointing at your IDL file and your program ID as the positional argument:
anchor idl init -f target/idl/vault.json [PROGRAM_ID] \
  --provider.cluster "[your-endpoint]"
Anchor stores the IDL in an account derived deterministically from your program ID, so anyone who knows the program can find its IDL without you handing them a URL. The wallet that signs this becomes the IDL’s authority, the only key allowed to change it later.
4. Fetch it back to prove it is really there. Run anchor idl fetch against the same program ID and write the result to a new file, then compare it to your local copy — they should match. This is the round trip a frontend or a teammate would make: program ID in, full interface out.

anchor idl fetch [PROGRAM_ID] --provider.cluster "[your-endpoint]" -o fetched-idl.json
Set up Codama. Install the Codama CLI and @codama/renderers-js, the renderer that emits a client compatible with @solana/kit. The Codama CLI automatically recognizes an Anchor IDL and converts it for you, so the renderer is the only extra piece you need. Run npm install --save-dev codama @codama/renderers-js. Then create a codama.json in your project root that points at your IDL and wires up the JS renderer:
{
  "idl": "target/idl/vault.json",
  "scripts": {
    "js": {
      "from": "@codama/renderers-js",
      "args": ["clients/js/src/generated"]
    }
  }
}

Now run the generator (the js argument matches the script key you just defined in codama.json):

npx codama run js
Codama writes the client into clients/js/src/generated/, including an index.ts barrel that re-exports every part of it:

export * from './accounts';
export * from './errors';
export * from './instructions';
export * from './programs';

Read one generated instruction. Open clients/js/src/instructions and find the file for one of your instructions. Notice that the argument names and account names come straight from your program. If you renamed an instruction in Rust and rebuilt, this file would change to match. That is the whole point: your program defines the contract, and the client follows.
Run it
# 1. Rebuild and produce a fresh IDL
anchor build

# 2. Confirm the program is on devnet (replace with your program ID)
solana program show [PROGRAM_ID] --url devnet

# 3. Publish the IDL on-chain to devnet
anchor idl init -f target/idl/vault.json [PROGRAM_ID] --provider.cluster "[your-endpoint]"

# 4. Fetch it back and verify
anchor idl fetch [PROGRAM_ID] --provider.cluster "[your-endpoint]" -o fetched-idl.json

# 5. Install Codama and the JS renderer
npm install --save-dev codama @codama/renderers-js

# 6. Generate the TypeScript client (reads codama.json)
npx codama run js

If you later change the program and want to update the published interface, rebuild and run anchor idl upgrade -f target/idl/vault.json [PROGRAM_ID] --provider.cluster devnet with the same authority wallet.