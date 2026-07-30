# Day 59: Adding the Increment Instruction and Testing Both Calls End to End

## Steps

1. Open `programs/counter/src/lib.rs`. Add a second handler called `increment` below the existing `initialize` handler. It takes no arguments, reads the counter account as mutable, and bumps the count by one using `checked_add` so an overflow returns an error instead of panicking.
   ```rust
   pub fn increment(ctx: Context<Increment>) -> Result<()> {
       let counter = &mut ctx.accounts.counter;
       counter.count = counter.count
           .checked_add(1)
           .ok_or(ProgramError::ArithmeticOverflow)?;
       Ok(())
   }
   ```
2. Below the `Initialize` accounts struct, add an `Increment` accounts struct. This is where the constraint lives. The `has_one = authority` attribute tells Anchor: before this handler runs, confirm the `authority` field stored inside the counter account matches the `authority` signer passed in this transaction. If they do not match, the transaction fails before my code executes.
   ```rust
   #[derive(Accounts)]
   pub struct Increment<'info> {
       #[account(mut, has_one = authority)]
       pub counter: Account<'info, Counter>,
       pub authority: Signer<'info>,
   }
   ```
3. Rebuild the program so the new instruction discriminator and the updated IDL land in `target/deploy/` and `target/idl/`. The build step also regenerates the typed account and instruction helpers the tests rely on.
   ```bash
   anchor build
   ```
4. Open the test file created on Day 58 at `programs/counter/tests/counter.rs`. Replace its entire contents with the version below: the same imports, plus a single test that covers both instructions end to end. It calls `initialize`, then `increment`, then reads the account back and asserts `count == 1`.
   ```rust
   use anchor_lang::{
       solana_program::system_program,
       AccountDeserialize, InstructionData, ToAccountMetas,
   };
   use litesvm::LiteSVM;
   use solana_instruction::Instruction;
   use solana_keypair::Keypair;
   use solana_signer::Signer;
   use solana_transaction::Transaction;

   #[test]
   fn initialize_then_increment() {
       let mut svm = LiteSVM::new();
       let program_id = counter::ID;
       let so_path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../target/deploy/counter.so");
       svm.add_program_from_file(program_id, so_path).unwrap();

       let authority = Keypair::new();
       svm.airdrop(&authority.pubkey(), 1_000_000_000).unwrap();
       let counter_kp = Keypair::new();

       // 1) initialize
       let init_ix = Instruction {
           program_id,
           accounts: counter::accounts::Initialize {
               counter: counter_kp.pubkey(),
               authority: authority.pubkey(),
               system_program: system_program::ID,
           }
           .to_account_metas(None),
           data: counter::instruction::Initialize {}.data(),
       };
       let bh = svm.latest_blockhash();
       let tx = Transaction::new_signed_with_payer(
           &[init_ix],
           Some(&authority.pubkey()),
           &[&authority, &counter_kp],
           bh,
       );
       svm.send_transaction(tx).unwrap();

       // 2) increment
       let inc_ix = Instruction {
           program_id,
           accounts: counter::accounts::Increment {
               counter: counter_kp.pubkey(),
               authority: authority.pubkey(),
           }
           .to_account_metas(None),
           data: counter::instruction::Increment {}.data(),
       };
       let bh = svm.latest_blockhash();
       let tx = Transaction::new_signed_with_payer(
           &[inc_ix],
           Some(&authority.pubkey()),
           &[&authority],
           bh,
       );
       svm.send_transaction(tx).unwrap();

       // 3) read and assert
       let account = svm.get_account(&counter_kp.pubkey()).unwrap();
       let parsed = counter::Counter::try_deserialize(&mut account.data.as_slice()).unwrap();
       assert_eq!(parsed.count, 1);
       assert_eq!(parsed.authority, authority.pubkey());
   }
   ```

## Run it

```bash
anchor build && cargo test -p counter -- --nocapture
```

## Terminal session

```text
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ anchor build
   Compiling counter v0.1.0 (/mnt/c/Users/T_fonsec/solana/counter/programs/counter)
    Finished `release` profile [optimized] target(s) in 7.25s
   Compiling libsecp256k1 v0.6.0
   Compiling counter v0.1.0 (/mnt/c/Users/T_fonsec/solana/counter/programs/counter)
   Compiling agave-syscalls v3.1.14
   Compiling solana-bpf-loader-program v3.1.14
   Compiling solana-loader-v4-program v3.1.14
   Compiling solana-builtins-default-costs v3.1.14
   Compiling solana-builtins v3.1.14
   Compiling solana-compute-budget-instruction v3.1.14
   Compiling litesvm v0.10.0
    Finished `test` profile [unoptimized + debuginfo] target(s) in 5m 01s
     Running unittests src/lib.rs (/mnt/c/Users/T_fonsec/solana/counter/target/debug/deps/counter-c915271b23012dd5)
     Running tests/counter.rs (/mnt/c/Users/T_fonsec/solana/counter/target/debug/deps/counter-a7f1652ecb1d2484)

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/counter$ anchor build && cargo test -p counter -- --nocapture

running 1 test
test test_id ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/counter.rs (target/debug/deps/counter-41f52319e809e6fd)

running 1 test
test initialize_then_increment ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.41s

   Doc-tests counter

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```
