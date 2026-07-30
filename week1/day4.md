# Day 4: Connecting a Browser Wallet with the Wallet Standard

## Steps

1. This challenge uses a brand-new Vite project, separate from the script-based projects I built in Days 1 to 3. That's because I'm now building a browser app rather than a Node.js script.

2. Create a new Vite project:

   ```bash
   npm create vite@latest day-4-wallet -- --template vanilla
   cd day-4-wallet
   npm install
   npm install @solana/kit @wallet-standard/app
   ```

   The `@wallet-standard/app` package provides a function called `getWallets()` that discovers any wallet extensions the user has installed. This is the Wallet Standard, an open protocol that lets any wallet work with any app without either side needing custom integration code.

3. Replace the contents of `index.html` with:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Solana Wallet Connect</title>
       <style>
         body {
           font-family: system-ui, sans-serif;
           max-width: 720px;
           margin: 40px auto;
           padding: 0 20px;
           background: #1a1a2e;
           color: #e0e0e0;
         }
         h1 { color: #00ffa3; }
         .wallet-list { margin: 20px 0; }
         .wallet-btn {
           display: flex;
           align-items: center;
           gap: 12px;
           width: 100%;
           padding: 12px 16px;
           margin: 8px 0;
           background: #16213e;
           color: #e0e0e0;
           border: 1px solid #333;
           border-radius: 8px;
           font-size: 16px;
           cursor: pointer;
         }
         .wallet-btn:hover { border-color: #00ffa3; }
         .wallet-btn img { width: 32px; height: 32px; border-radius: 4px; }
         .connected {
           background: #16213e;
           padding: 20px;
           border-radius: 8px;
           margin: 20px 0;
         }
         .address {
           font-family: monospace;
           font-size: 14px;
           word-break: break-all;
           color: #00ffa3;
           margin: 8px 0;
         }
         .balance { font-size: 28px; margin: 16px 0; }
         .disconnect-btn {
           padding: 8px 16px;
           background: transparent;
           color: #ff4444;
           border: 1px solid #ff4444;
           border-radius: 4px;
           cursor: pointer;
           font-size: 14px;
         }
         .disconnect-btn:hover { background: #ff444420; }
         #status { color: #888; margin: 10px 0; }
         #error { color: #ff4444; margin: 10px 0; }
         .no-wallets {
           padding: 20px;
           background: #16213e;
           border-radius: 8px;
           text-align: center;
           color: #888;
         }
         .no-wallets a { color: #00ffa3; }
       </style>
     </head>
     <body>
       <h1>Connect a Solana wallet</h1>
       <div id="status">Looking for wallets...</div>
       <div id="error"></div>
       <div id="wallet-list" class="wallet-list"></div>
       <div id="connected" class="connected" style="display: none"></div>
       <script type="module" src="src/main.js"></script>
     </body>
   </html>
   ```

   I can also delete `src/style.css`; the new `index.html` has all the styles inline, so the default stylesheet isn't needed.

4. Replace the contents of `src/main.js` with:

   ```javascript
   import { createSolanaRpc, devnet } from "@solana/kit";
   import { getWallets } from "@wallet-standard/app";

   const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
   const walletListDiv = document.getElementById("wallet-list");
   const connectedDiv = document.getElementById("connected");
   const statusDiv = document.getElementById("status");
   const errorDiv = document.getElementById("error");

   let connectedWallet = null;

   function isSolanaWallet(wallet) {
     return wallet.chains?.some((chain) => chain.startsWith("solana:"));
   }

   function renderWalletList(wallets) {
     const solanaWallets = wallets.filter(isSolanaWallet);

     if (solanaWallets.length === 0) {
       walletListDiv.innerHTML = `
         <div class="no-wallets">
           No Solana wallets found.<br>
           Install <a href="https://phantom.app" target="_blank">Phantom</a>
           or another Solana wallet to continue.
         </div>`;
       statusDiv.textContent = "";
       return;
     }

     statusDiv.textContent = `Found ${solanaWallets.length} wallet(s):`;
     walletListDiv.innerHTML = "";

     for (const wallet of solanaWallets) {
       const btn = document.createElement("button");
       btn.className = "wallet-btn";
       const icon = wallet.icon;
       btn.innerHTML = icon
         ? `<img src="${icon}" alt="" /> ${wallet.name}`
         : wallet.name;
       btn.addEventListener("click", () => connectWallet(wallet));
       walletListDiv.appendChild(btn);
     }
   }

   async function connectWallet(wallet) {
     errorDiv.textContent = "";
     const connectFeature = wallet.features["standard:connect"];
     if (!connectFeature) {
       errorDiv.textContent = "This wallet doesn't support connecting.";
       return;
     }

     try {
       statusDiv.textContent = "Requesting connection...";
       const { accounts } = await connectFeature.connect();

       if (accounts.length === 0) {
         errorDiv.textContent = "No accounts returned. Did you reject the request?";
         statusDiv.textContent = "";
         return;
       }

       connectedWallet = wallet;
       const account = accounts[0];
       const address = account.address;

       const { value: balanceInLamports } = await rpc.getBalance(address).send();
       const balanceInSol = (Number(balanceInLamports) / 1_000_000_000).toFixed(9);

       walletListDiv.style.display = "none";
       statusDiv.textContent = "";
       connectedDiv.style.display = "block";
       connectedDiv.innerHTML = `
         <h3>Connected to ${wallet.name}</h3>
         <div class="address">${address}</div>
         <div class="balance">${balanceInSol} SOL</div>
         <button class="disconnect-btn" id="disconnectBtn">Disconnect</button>`;

       document
         .getElementById("disconnectBtn")
         .addEventListener("click", () => disconnectWallet(wallet));
     } catch (err) {
       errorDiv.textContent = `Connection failed: ${err.message}`;
       statusDiv.textContent = "";
     }
   }

   async function disconnectWallet(wallet) {
     const disconnectFeature = wallet.features["standard:disconnect"];
     if (disconnectFeature) {
       await disconnectFeature.disconnect();
     }
     connectedWallet = null;
     connectedDiv.style.display = "none";
     walletListDiv.style.display = "block";
     statusDiv.textContent = "Disconnected. Choose a wallet to reconnect:";
   }

   const { get, on } = getWallets();
   renderWalletList(get());
   on("register", () => {
     if (!connectedWallet) {
       renderWalletList(get());
     }
   });
   ```

## Run It

Start the dev server:

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). If that port is already in use, Vite will automatically pick the next available one; check the terminal output for the exact URL. I should see my installed wallet listed with its icon. Clicking it makes the wallet extension pop up asking to approve the connection. Once approved, the page shows the wallet address and devnet balance.
