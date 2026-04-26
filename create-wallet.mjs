import {
  generateKeyPairSigner,
  createSolanaRpc,
  devnet,
  address,
} from "@solana/kit";

const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

// Generate a new wallet
const wallet = await generateKeyPairSigner();

console.log("Wallet address:", wallet.address);

console.log("\n Go to https://faucet.solana.com/");
console.log(" Select Devnet");
console.log(" Paste this address and request SOL\n");

// Check balance
const myAddress = address("Your-Address");
const { value: balance } = await rpc.getBalance(myAddress).send();
const balanceInSol = Number(balance) / 1_000_000_000;

console.log(`Balance: ${balanceInSol} SOL`);