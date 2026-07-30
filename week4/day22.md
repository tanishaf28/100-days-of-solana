# Day 22: Inspecting Wallet, Token Program, and System Program Accounts

## Steps

1. Point the CLI at devnet and confirm my wallet address:

   ```bash
   solana config set --url https://api.devnet.solana.com
   solana address
   ```

   Copy the address that's printed. This is the public key of my wallet account.

2. If the wallet is empty, give it some devnet SOL to work with:

   ```bash
   solana airdrop 2
   ```

3. Inspect my own wallet account:

   ```bash
   solana account $(solana address)
   ```

   Output looks something like this:

   ```text
   Public Key: YourWa11etAddressHere...
   Balance: 2 SOL
   Owner: 11111111111111111111111111111111
   Executable: false
   Rent Epoch: 18446744073709551615
   Length: 0 (0x0) bytes
   ```

   Take note of each field: the wallet is owned by the System Program (that long string of ones), it is not executable (it's not a program), and it has 0 bytes of data (wallets don't store custom data, just a SOL balance).

4. Compare that to a program account. Inspect the SPL Token Program:

   ```bash
   solana account TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
   ```

   Notice the differences: this account has `Executable: true`, its owner is `BPFLoader2111111111111111111111111111111111` (the program that loaded it), and the data field contains the compiled program bytecode.

5. Look at the System Program itself:

   ```bash
   solana account 11111111111111111111111111111111
   ```

   This is a native built-in program. It's the only program on Solana that can create new accounts. Compare its fields to what was seen in steps 3 and 4.

6. For a richer view, inspect my wallet account in JSON format:

   ```bash
   solana account $(solana address) --output json
   ```

   This gives machine-readable output with the same fields: lamports, data, owner, executable, and rentEpoch. I can also paste my wallet address into the Solana Explorer to see the same information in a visual interface.
