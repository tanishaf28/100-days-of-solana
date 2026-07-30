import { useState } from "react";
import { PublicKey, Connection } from "@solana/web3.js";
import { PROGRAM_ID } from "./program";

const connection = new Connection(
  "https://api.devnet.solana.com"
);

// Matches the ShipRecord account layout in programs/proof-of-ship/src/lib.rs
function decodeShipRecord(data: Uint8Array) {
  let offset = 8; // Anchor account discriminator

  const builder = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  const nameLen = view.getUint32(offset, true);
  offset += 4;
  const projectName = new TextDecoder().decode(data.slice(offset, offset + nameLen));
  offset += nameLen;

  const msgLen = view.getUint32(offset, true);
  offset += 4;
  const message = new TextDecoder().decode(data.slice(offset, offset + msgLen));
  offset += msgLen;

  const shippedAt = view.getBigInt64(offset, true);
  offset += 8;

  const bump = data[offset];

  return {
    builder: builder.toBase58(),
    projectName,
    message,
    shippedAt: new Date(Number(shippedAt) * 1000).toISOString(),
    bump,
  };
}

export default function ShipRecord() {

  const [record, setRecord] = useState<any>(null);

  async function fetchRecord(walletAddress:string) {

    const wallet = new PublicKey(walletAddress);

    const [pda] =
      PublicKey.findProgramAddressSync(
        [
          new TextEncoder().encode("ship"),
          wallet.toBuffer()
        ],
        PROGRAM_ID
      );


    const account =
      await connection.getAccountInfo(pda);


    if (!account) {
      setRecord("No shipment found");
      return;
    }


    setRecord({
      address: pda.toBase58(),
      ...decodeShipRecord(account.data),
    });
  }


  return (
    <div>

      <h2>
        Proof of Ship
      </h2>

            <button
        onClick={() => {
          fetchRecord(
            "DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A"
          );
        }}
      >
        Check Ship Record
      </button>


      <pre>
        {JSON.stringify(record,null,2)}
      </pre>

    </div>
  );
}