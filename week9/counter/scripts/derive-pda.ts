import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("HxtUYmnPb73bdujNSuMd8XCsX4yH2N6CPiwPz3LG5mqY");

const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
  programId
);

console.log("Seeds:        [\"counter\"]");
console.log("Program ID:   ", programId.toBase58());
console.log("PDA:          ", pda.toBase58());
console.log("Canonical bump:", bump);