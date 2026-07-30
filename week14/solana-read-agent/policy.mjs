import { web3 } from "@anchor-lang/core";

const { PublicKey, LAMPORTS_PER_SOL } = web3;


// PUT YOUR SECOND WALLET ADDRESS HERE
const ALLOWED_RECIPIENTS = new Set([
  "DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A"
]);


const MAX_LAMPORTS_PER_TRANSFER =
  0.1 * LAMPORTS_PER_SOL;


const MAX_LAMPORTS_PER_SESSION =
  0.25 * LAMPORTS_PER_SOL;


let sessionSpent = 0;



export function checkTransferPolicy(recipient, lamports){

  let recipientKey;

  try {

    recipientKey =
      new PublicKey(recipient);

  } catch {

    return {
      allowed:false,
      reason:"Invalid Solana address"
    };

  }



  if(!ALLOWED_RECIPIENTS.has(recipientKey.toBase58())){

    return {
      allowed:false,
      reason:
      `Recipient ${recipientKey.toBase58()} is not allowlisted`
    };

  }



  if(!Number.isInteger(lamports) || lamports <= 0){

    return {
      allowed:false,
      reason:"Amount must be positive"
    };

  }



  if(lamports > MAX_LAMPORTS_PER_TRANSFER){

    return {
      allowed:false,
      reason:
      "Transfer exceeds 0.1 SOL limit"
    };

  }



  if(sessionSpent + lamports > MAX_LAMPORTS_PER_SESSION){

    return {
      allowed:false,
      reason:
      "Session spending limit exceeded"
    };

  }



  return {
    allowed:true,
    reason:"Approved"
  };

}



export function recordSpend(lamports){

  sessionSpent += lamports;

}
