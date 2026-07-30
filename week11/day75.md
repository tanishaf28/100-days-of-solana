# Day 75: Breaking CPIs on purpose to read the failure modes

## Steps

1. Open the caller program from Day 74. Confirm the happy path still works by running the existing test once. I want a green baseline before breaking things, because a failure I cannot compare to success teaches nothing.
2. **Failure one: wrong signer seeds.** Open the vault program from Day 73 (the PDA-signed withdraw is the only place in this arc that uses signer seeds). Find the line that builds the `signer_seeds` slice for the `CpiContext`. Change one byte of one seed, or pass the wrong bump. Rebuild and rerun that program's withdraw test. Copy the full `Program log:` output into a note. Look for the line that mentions a privilege escalation or a missing signature on the PDA.
3. **Failure two: missing or wrong account.** Restore the seeds. Now go to the Accounts struct on the callee's instruction. Add a new account constraint that the caller does not yet pass, for example a second PDA derived from a different seed, or change the `has_one` or `seeds` constraint on an existing one. Rebuild and run. Capture the log. The runtime names the failing constraint and the account it tried to validate. It's worth slowing down to read how specific that message is.
4. **Failure three: wrong program ID.** Restore the constraint. In the caller, change the program field passed into `CpiContext::new` so it points at the wrong program. The cleanest way is to add `pub system_program: Program<'info, System>` to the `Bump` accounts struct, then swap `ctx.accounts.counter_program.key()` for `ctx.accounts.system_program.key()` in the handler. The System Program at `11111111111111111111111111111111` is a useful wrong answer because it exists and will respond, just not in a way that helps. Rebuild and run. Read the log. The shape of this failure is different from the first two, because the call reaches a real program that has no idea what to do with the instruction data.
5. For each of the three failures, write one sentence in my notes that finishes the prompt: "When I see this line in the logs, the cause is...". That mapping is the deliverable. The code goes back to working when done, but the mapping stays with me.

## Run it

```bash
anchor build
anchor test
```

If I'd rather watch a live deploy fail against my local validator instead of using the in-process test runner, deploy the broken caller and stream the logs in a second terminal while sending the failing instruction:

```bash
solana logs --url localhost
```

## Captured output

### Failure 1: wrong signer seeds (vault withdraw)

```text
$ /mnt/c/Users/T_fonsec/solana/vault/node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 'tests/**/*.ts'


  vault
vault after deposit: 500000000
    1) deposits, then the program signs to withdraw


  0 passing (204ms)
  1 failing

  1) vault
       deposits, then the program signs to withdraw:
     Simulation failed.
Message: Transaction simulation failed: Error processing Instruction 0: Program failed to complete.
Logs:
[
  "Program 9BxMV1hKv6gik97y98AtuFVXuDzYtcF6Lda8xveg4QBs invoke [1]",
  "Program log: Instruction: Withdraw",
  "Program 9BxMV1hKv6gik97y98AtuFVXuDzYtcF6Lda8xveg4QBs consumed 4251 of 200000 compute units",
  "Program 9BxMV1hKv6gik97y98AtuFVXuDzYtcF6Lda8xveg4QBs failed: Could not create program address with signer seeds: Provided seeds do not result in a valid address"
].
Catch the `SendTransactionError` and call `getLogs()` on it for full details.
error Command failed with exit code 1.
```

### Failure 2: deploy failure encountered along the way (vault)

```text
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/vault$ anchor test --skip-local-validator
   Compiling vault v0.1.0 (/mnt/c/Users/T_fonsec/solana/vault/programs/vault)
    Finished `release` profile [optimized] target(s) in 5.40s
   Compiling vault v0.1.0 (/mnt/c/Users/T_fonsec/solana/vault/programs/vault)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 27.19s
     Running unittests src/lib.rs (/mnt/c/Users/T_fonsec/solana/vault/target/debug/deps/vault-870f1f9d8c423a2e)
Deploying cluster: http://127.0.0.1:8899
Upgrade authority: /home/t_fonsec/.config/solana/id.json
Deploying program "vault"...
Program path: /mnt/c/Users/T_fonsec/solana/vault/target/deploy/vault.so...ogram failed to complete.
Program already exists, upgrading...
Auto-extending program data by 4048 bytes (108976 -> 113024) before upgrade...
Attempt 1 failed: Auto-extend failed: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: invalid instruction data; 3 log messages:
  Program BPFLoaderUpgradeab1e11111111111111111111111 invoke [1]
  ExtendProgram was superseded by ExtendProgramChecked
  Program BPFLoaderUpgradeab1e11111111111111111111111 failed: invalid instruction data


Deploy attempt 2 of 3
Auto-extending program data by 4048 bytes (108976 -> 113024) before upgrade...
Attempt 2 failed: Auto-extend failed: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: invalid instruction data; 3 log messages:
  Program BPFLoaderUpgradeab1e11111111111111111111111 invoke [1]
  ExtendProgram was superseded by ExtendProgramChecked
  Program BPFLoaderUpgradeab1e11111111111111111111111 failed: invalid instruction data


Deploy attempt 3 of 3
Auto-extending program data by 4048 bytes (108976 -> 113024) before upgrade...
Attempt 3 failed: Auto-extend failed: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: invalid instruction data; 3 log messages:
  Program BPFLoaderUpgradeab1e11111111111111111111111 invoke [1]
  ExtendProgram was superseded by ExtendProgramChecked
  Program BPFLoaderUpgradeab1e11111111111111111111111 failed: invalid instruction data


Deploy failed after 3 attempts.
```

### Failure 3: wrong program ID (compose-lab bump)

```text
$ /mnt/c/Users/T_fonsec/solana/compose-lab/node_modules/.bin/ts-mocha -p ./tsconfig.json -t 1000000 'tests/**/*.ts'


  compose-lab
    1) the caller bumps the counter through a CPI


  0 passing (389ms)
  1 failing

  1) compose-lab
       the caller bumps the counter through a CPI:
     Simulation failed.
Message: Transaction simulation failed: Error processing Instruction 0: invalid instruction data.
Logs:
[
  "Program AUAFUwnAvvAZh9AsfAHFyHUp8sEJiEwaQR8hUpPMXTPG invoke [1]",
  "Program log: Instruction: Bump",
  "Program 11111111111111111111111111111111 invoke [2]",
  "Program 11111111111111111111111111111111 failed: invalid instruction data",
  "Program AUAFUwnAvvAZh9AsfAHFyHUp8sEJiEwaQR8hUpPMXTPG consumed 3641 of 200000 compute units",
  "Program AUAFUwnAvvAZh9AsfAHFyHUp8sEJiEwaQR8hUpPMXTPG failed: invalid instruction data"
].
Catch the `SendTransactionError` and call `getLogs()` on it for full details.


error Command failed with exit code 1.
```

Streamed logs for the same failure, via `solana logs --url localhost`:

```text
Streaming transaction logs. Confirmed commitment
Transaction executed in slot 500:
  Signature: 45fAnQuQTLoxM5sp3qdKWmn9F6Pj5NGCZgWJ7CRY1PpgK4FLVP1n5AuHnYGUrvuvsz2BJabR3XPSdZEADv7GHdRY
  Status: Ok
  Log Messages:
    Program 11111111111111111111111111111111 invoke [1]
    Program 11111111111111111111111111111111 success
    Program BPFLoaderUpgradeab1e11111111111111111111111 invoke [1]
    Program BPFLoaderUpgradeab1e11111111111111111111111 success
Transaction executed in slot 501:
  Signature: 3MgpRXjVDLa9oMvFSBHWWNBLHSyu7RLcxD3wzfeqVxAQHXfV9kL98qwMDJYxsSsbHcrJrwSd4EH3HnxunPLdeNvh
  Status: Ok
  Log Messages:
    Program ComputeBudget111111111111111111111111111111 invoke [1]
    Program ComputeBudget111111111111111111111111111111 success
    Program BPFLoaderUpgradeab1e11111111111111111111111 invoke [1]
    Program BPFLoaderUpgradeab1e11111111111111111111111 success
Disconnected: receiving on an empty and disconnected channel
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/compose-lab$
```
