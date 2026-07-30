# Day 18: Tracking Transaction Confirmation Stages

## Steps

### Step 1: Understand what confirmation actually means

When a transaction is sent on Solana, it does not go from "pending" to "done" in one jump. It moves through three commitment levels:

- **Processed:** A validator included the transaction in a recent block. Think of this like a POST request reaching the server. The server acknowledged it, but nothing is guaranteed yet.
- **Confirmed:** A supermajority of validators (66%+) voted on the block containing the transaction. This is like getting a 200 OK from a load-balanced API where most backend nodes agree the write succeeded. In Solana's entire history, no confirmed transaction has ever been reversed.
- **Finalized:** At least 31 additional confirmed blocks have been built on top of the transaction's block. This is the equivalent of a database commit that has been replicated, flushed to disk, and backed up. It is irreversible.

My tool currently waits for "confirmed" behind a single function call and walks away. Today's job is to break that into observable stages and report each one.

### Step 2: Swap the all-in-one factory for a manual send + poll

Yesterday's tool used `sendAndConfirmTransactionFactory`, which bundles sending the transaction and waiting for confirmation into one call. That is convenient, but it gives no hook to report progress between stages. Today I split it apart: send the transaction, then poll the network for its status as it climbs the commitment ladder.

Update the imports at the top of the file to add one new helper from `@solana/kit`:

```javascript
import {
	address,
	createKeyPairSignerFromBytes,
	createSolanaRpc,
	createSolanaRpcSubscriptions,
	pipe,
	createTransactionMessage,
	setTransactionMessageFeePayerSigner,
	setTransactionMessageLifetimeUsingBlockhash,
	appendTransactionMessageInstruction,
	signTransactionMessageWithSigners,
	getSignatureFromTransaction,
	getBase64EncodedWireTransaction,
	lamports,
	devnet,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
```

`getBase64EncodedWireTransaction` is what lets a signed transaction be handed directly to `rpc.sendTransaction()` instead of going through the factory.

### Step 3: Add a confirmation progress display

Before wiring up the new send logic, set up a simple status reporter:

```javascript
function statusUpdate(message) {
	process.stdout.clearLine(0);
	process.stdout.cursorTo(0);
	process.stdout.write(message);
}
```

This overwrites the current terminal line instead of printing a new one each time, giving a clean progress indicator.

### Step 4: Send with staged confirmation tracking

Replace the transaction-sending logic with a version that reports on each commitment level. Solana Kit does not ship with a single "wait for this commitment level" call, so I wrote a tiny polling helper that walks `getSignatureStatuses` up the ladder. `transferWithConfirmation` builds the transaction, sends it, and calls the helper twice, once for confirmed, once for finalized, with a status update between each stage.

See the code in this gist.

Then wire it into `main()`. In the Day 17 file, sections 4 (Build the transaction), 5 (Sign the transaction), and 6 (Send and confirm) all live inline inside `main()`. Delete those three sections, `transferWithConfirmation` now does all of that work, and replace them with a single call to the new function. Steps 5 and 6 below show exactly what goes in their place.

### Step 5: Print the explorer link

In place of the old sections 4-6 inside `main()`, call `transferWithConfirmation` and print the explorer link from the signature it returns:

```javascript
const signature = await transferWithConfirmation(rpc, sender, recipientAddress, solAmount);

console.log("Transaction successful!");
console.log(`Signature: ${signature}`);
console.log(`View on Solana Explorer:`);
console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
```

I can also delete the "Show updated balance" section at the bottom of `main()` to keep the output focused, or leave it in.

### Step 6: Add error handling for failed confirmations

Transactions can fail. A network hiccup, an expired blockhash, or insufficient funds could all cause problems, and the `waitForCommitment` helper will throw if the network reports an on-chain error. Wrap the call from Step 5 in a try/catch:

```javascript
try {
	const signature = await transferWithConfirmation(rpc, sender, recipientAddress, solAmount);
	console.log("Transaction successful!");
	console.log(`Signature: ${signature}`);
	console.log(`View on Solana Explorer:`);
	console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
} catch (error) {
	console.error("\nTransaction failed:");
	console.error(error.message);
	process.exit(1);
}
```

## Run It

```bash
node transfer.mjs [RECIPIENT_ADDRESS] 0.01
```

Watching the terminal, I saw the status line update in place as the transaction progressed through each stage. On devnet, the jump from "processed" to "confirmed" typically takes about 400 milliseconds, and reaching "finalized" takes roughly 6 to 12 seconds. Once it completed, I opened the explorer link in the browser and verified that the transaction, the amount, and the recipient all matched.
