# Day 25: Native Programs, Sysvars, and the System Program in Depth

## Steps

1. **Set the CLI to devnet and check my wallet.** Make sure the CLI is pointed at devnet and that I have a keypair ready.

   ```bash
   solana config set --url devnet
   solana address
   solana balance
   ```

   If the balance is zero, airdrop some devnet SOL:

   ```bash
   solana airdrop 2
   ```

   > Note: The devnet airdrop can sometimes fail due to rate limiting. If this happens use the web faucet instead.

2. **Inspect my own wallet account.** My wallet is a system account, meaning it is owned by the System Program. Let's look at its raw structure.

   ```bash
   solana account $(solana address)
   ```

   Five key fields show up:

   - **Lamports:** balance in the smallest unit of SOL (1 SOL = 1,000,000,000 lamports)
   - **Data Length:** for a basic wallet, this is 0 bytes because system accounts do not store custom data
   - **Owner:** `11111111111111111111111111111111`, which is the System Program's address
   - **Executable:** `false`, because my wallet is not a program
   - **Rent Epoch:** a legacy field (rent collection has been deprecated on Solana, so this is set to the maximum value for all rent-exempt accounts)

   Any account whose owner is `11111111111111111111111111111111` is a system account.

3. **Inspect the System Program itself.** The System Program is also an account on Solana.

   ```bash
   solana account 11111111111111111111111111111111
   ```

   Differences from my wallet:

   - `Executable` is `true`, because this account contains program code
   - `Owner` is `NativeLoader1111111111111111111111111111111`, the loader responsible for Solana's built-in native programs

   This is a fundamental insight: programs on Solana are just accounts with their `Executable` flag set to `true`. The System Program is not magic; it is an account like any other, just one that happens to contain executable code and is owned by the Native Loader.

4. **Compare with other native programs.** Solana has several native programs built into the runtime.

   ```bash
   solana account Stake11111111111111111111111111111111111111
   solana account Vote111111111111111111111111111111111111111
   ```

   These are the Stake Program and the Vote Program. They share the same pattern as the System Program: `Executable` is `true`, and they are all owned by the Native Loader. These programs handle validator staking and voting on the network.

5. **Explore a sysvar account.** Sysvar accounts are special read-only accounts at predefined addresses that expose cluster-wide state, such as the current time or the rent cost, like environment variables for the entire Solana network.

   ```bash
   solana account SysvarC1ock11111111111111111111111111111111
   solana account SysvarRent111111111111111111111111111111111
   ```

   - The Clock sysvar holds the current slot, epoch, and Unix timestamp
   - The Rent sysvar holds the lamports-per-byte-year rate (though rent collection itself is deprecated, the rent-exemption threshold is still calculated from this)

   Both are owned by the `Sysvar1111111111111111111111111111111111111` program, and both have `Executable` set to `false` because they hold data, not code. This is the opposite of what native programs look like.

6. **View accounts in the Solana Explorer.** Open Solana Explorer (devnet) in a browser and paste in each of the addresses inspected:

   - My wallet address
   - `11111111111111111111111111111111` (System Program)
   - `SysvarC1ock11111111111111111111111111111111` (Clock sysvar)

   The Explorer gives the same information in a visual format, along with transaction history. It even labels the account type (e.g. "System Program" or "Sysvar") automatically.

7. **Pull it all together with JSON output.** For a structured view, request JSON output from the CLI.

   ```bash
   solana account $(solana address) --output json
   solana account 11111111111111111111111111111111 --output json
   ```

   JSON output is useful when I want to pipe account data into scripts or compare fields programmatically. Comparing the two JSON outputs side by side, my wallet vs. the System Program, the differences in `executable`, `owner`, and `data` tell everything about what kind of account is being looked at.
