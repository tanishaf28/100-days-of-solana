# Day 67: Closing a counter account and refunding rent

## Steps

1. Open `programs/counter/src/lib.rs` and add a new instruction handler beneath `increment`. The body has nothing to do, because Anchor will do all the real work in the accounts struct.

   ```rust
   pub fn close_counter(_ctx: Context<CloseCounter>) -> Result<()> {
       Ok(())
   }
   ```

2. At the bottom of the file, next to the other `#[derive(Accounts)]` structs, add the accounts struct for the new instruction. The `close = user` attribute is the entire feature I'm shipping today.

   ```rust
   #[derive(Accounts)]
   pub struct CloseCounter<'info> {
       #[account(
           mut,
           close = user,
           seeds = [b"counter", user.key().as_ref()],
           bump = counter.bump,
           has_one = user,
       )]
       pub counter: Account<'info, Counter>,
       #[account(mut)]
       pub user: Signer<'info>,
   }
   ```

   Read that struct carefully. `close = user` tells Anchor to drain the counter's lamports into the user account and mark the data as closed when the instruction returns. `has_one = user` is the wall that stops a stranger from closing a counter that does not belong to them, because Anchor checks that the `user` field stored on the counter matches the signer passed in. The PDA derivation still uses the same seeds and the stored bump, so the address being operated on is exactly the one created two days ago.

3. Open `tests/counter.ts`, the file rewritten on Day 66. Add this new test inside the existing `describe` block, below the other tests. The shape is: initialize a counter, capture the wallet balance and the account's lamports, call `closeCounter`, then assert the account is gone and the rent came back.

   ```typescript
   it("closes a counter and refunds the rent", async () => {
     const user = provider.wallet.publicKey;
     const [counterPda] = anchor.web3.PublicKey.findProgramAddressSync(
       [Buffer.from("counter"), user.toBuffer()],
       program.programId,
     );

     // Initialize a fresh counter if the previous test already closed it.
     const existing = await provider.connection.getAccountInfo(counterPda);
     if (existing === null) {
       await program.methods.initCounter().rpc();
     }

     const counterAccount = await provider.connection.getAccountInfo(counterPda);
     const rentLamports = counterAccount!.lamports;
     const balanceBefore = await provider.connection.getBalance(user);

     await program.methods.closeCounter().rpc();

     const counterAfter = await provider.connection.getAccountInfo(counterPda);
     const balanceAfter = await provider.connection.getBalance(user);

     if (counterAfter !== null) {
       throw new Error("counter account still exists after close");
     }

     console.log("rent refunded (lamports):", rentLamports);
     console.log("net wallet change (lamports):", balanceAfter - balanceBefore);
   });
   ```

   The first `getAccountInfo` call tells me how much SOL the account is holding. The second one, after the close, should return `null`, because the lamport balance hit zero and the runtime swept the account out of existence at the end of the transaction.

4. Build the program so the IDL and TypeScript types pick up the new instruction.

   ```bash
   anchor build
   ```

5. Run the tests. Anchor will spin up a local validator, deploy the updated program, and walk through the existing tests plus the new one. Watch the console for the two lines printed above.

## Run it

```bash
anchor test --validator legacy
```

The `--validator legacy` flag points Anchor at the `solana-test-validator` from the Solana toolchain. Anchor defaults to a separate validator called surfpool, and a bare `anchor test` without it installed fails with `Failed to spawn surfpool: No such file or directory`. The `ts-mocha` test script set in `Anchor.toml` on Day 65 still applies, so `anchor test` runs `tests/counter.ts`.

## Output

```text
  counter with config
    ✔ initializes config and a counter, then increments (1370ms)
    ✔ refuses to increment when paused (840ms)
rent refunded (lamports): 1231920
net wallet change (lamports): 1226944
    ✔ closes a counter and refunds the rent (429ms)


  3 passing (3s)

Done in 22.89s.
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$
```
