The challenge
What you’ll need
A terminal with Node.js 18 or newer and a package manager (npm comes with Node).
A code editor such as VS Code.
A modern browser with a Solana wallet extension installed: Phantom or Solflare both implement the Wallet Standard.
A little devnet SOL in that wallet. If the balance reads zero, top it up from the Solana devnet faucet.
Steps
Scaffold a frontend with the official Solana template. The Solana Foundation maintains create-solana-dapp, a generator that wires up a React app with a wallet connection already in place. Run it, and at the prompts pick the Kit Framework group, then the react-vite template. It is built on @solana/react-hooks and @solana/client — the current official React stack. You can browse the full set of starters in the templates gallery.
npx create-solana-dapp@latest my-solana-frontend
cd my-solana-frontend
npm install
The template wires up wallet connection for you, so you do not write any of it. It generates:

src/providers.tsx — a SolanaProvider wrapping your app, with the RPC endpoint already set to devnet. This is the one place you would change the cluster.
src/App.tsx — the connect/disconnect UI, built on the useWalletConnection hook, which discovers every Wallet-Standard wallet and returns { connectors, connect, disconnect, wallet, status }. The connected address is wallet?.account.address.
So today’s work is to run it, connect, then add a balance readout and a send button in the steps below.

Start the dev server and open the local URL it prints (Vite serves on http://localhost:5173 by default).
npm run dev
Set your wallet to Devnet. The app itself already runs on devnet — that is the endpoint: "https://api.devnet.solana.com" in src/providers.tsx, the one place the network is configured (change it there if you ever need another cluster). Now make your wallet match: open your Phantom or Solflare extension, go into its settings, and switch the network to Devnet. A mismatch here — wallet on mainnet while the app reads devnet, or vice versa — is the single most common reason a balance reads zero.

Click Connect in the app, pick your wallet from the dropdown, and approve the connection request in the extension popup. The app now knows your public key.

Show your balance. Open src/App.tsx. Its App() function already calls useWalletConnection() and has wallet in scope. Add the useBalance hook right beside that call, then render the value where the template already shows your address.

Add the import at the top, and the hook inside App() next to the existing useWalletConnection():

import { useBalance } from '@solana/react-hooks';

// inside App(), alongside the existing hooks:
const { lamports } = useBalance(wallet?.account.address);
Then, in the returned JSX, find the span that renders the address ({address ?? "No wallet connected"}) and drop the balance next to it:

<span className="font-mono text-xs">
  {lamports != null ? `${Number(lamports) / 1e9} SOL` : '—'}
</span>
Copy the address and confirm it on Solana Explorer (cluster set to devnet) — the same wallet and balance you have been building up since Arc 1.
6. Wire a send flow. Still in App(), add a useSolTransfer hook and a small recipient input, then a button that calls send. This is the transaction Day 89 wraps in error handling.

Imports and hooks at the top of App() (next to the ones from Step 5):

import { useState } from 'react';
import { useSolTransfer } from '@solana/react-hooks';

// inside App():
const { send, isSending } = useSolTransfer();
const [destination, setDestination] = useState('');
Then add this to the returned JSX — dropping it inside the existing wallet-connection section is a natural spot:

<div className="flex flex-wrap items-center gap-3 pt-4">
  <input
    value={destination}
    onChange={(e) => setDestination(e.target.value)}
    placeholder="Recipient address"
    className="rounded-lg border border-border-low bg-cream px-3 py-2 font-mono text-xs"
  />
  <button
    onClick={() => send({ amount: 1_000_000n, destination })}
    disabled={isSending || !destination}
    className="rounded-lg border border-border-low bg-card px-3 py-2 font-medium"
  >
    {isSending ? 'Sending…' : 'Send 0.001 SOL'}
  </button>
</div>
Paste any devnet address into the input and click — it submits a real 0.001 SOL transfer the wallet must approve, the flow tomorrow hardens. (To call your vault’s deposit instead of a plain transfer, build the instruction with your Day 87 client and send it via the useSendTransaction hook — same shape, one instruction swapped in.)

Run it
npx create-solana-dapp@latest my-solana-frontend
cd my-solana-frontend
npm install
npm run dev
