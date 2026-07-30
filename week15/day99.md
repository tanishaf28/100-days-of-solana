# Day 99: Build Your Capstone and Ship It to Devnet

**Goal:** Build, test, deploy your own Solana capstone project to devnet and connect it with a previous project.

## Requirements

The project must have:

- [x] Anchor program
- [x] PDA account with custom seeds
- [x] Constraint/custom error handling
- [x] Success + failure tests
- [x] Deployment on Solana devnet
- [x] Integration with another project (frontend, agent, or token)

## Steps

### 1. Create project

```bash
anchor init proof-of-ship
cd proof-of-ship
```

Clean old files and create a tests folder:

```bash
rm -rf programs/proof-of-ship/tests
mkdir tests
```

### 2. Set up TypeScript tests

Update `Anchor.toml`:

```toml
[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

Install dependencies:

```bash
yarn add @anchor-lang/core
yarn add --dev ts-node @types/node @types/mocha
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["mocha", "chai", "node"],
    "typeRoots": ["./node_modules/@types"],
    "lib": ["es2020"],
    "module": "commonjs",
    "target": "es2020"
  }
}
```

### 3. Build the Solana program

Create a `ShipRecord` PDA. The PDA uses:

```
["ship", wallet_address]
```

so each wallet can create only one shipping record.

The program stores:

- Wallet address
- Project name
- Message
- Timestamp

It rejects:

- Project name over 64 chars
- Message over 256 chars

Sync and build:

```bash
anchor keys sync
anchor build
```

### 4. Add tests

- Test 1: create a ship record successfully
- Test 2: reject creating a second record from the same wallet

Run:

```bash
anchor test
```

or against devnet:

```bash
anchor test --provider.cluster devnet
```

### 5. Deploy to devnet

Check SOL:

```bash
solana balance --url devnet
```

Deploy:

```bash
anchor program deploy \
--provider.cluster "YOUR_DEVNET_RPC" \
-- --with-compute-unit-price 50000 --use-rpc
```

Get the program ID:

```bash
anchor keys list
```

Verify:

```bash
solana program show YOUR_PROGRAM_ID --url devnet
```

### 6. Connect another project

Choose one:

- **Frontend:** a React app reads and displays the `ShipRecord`
- **Agent:** the Ollama/Solana agent fetches wallet shipping status
- **Token:** mint a Token-2022 badge for the capstone

The idea: turn all the previous Solana exercises into one complete project that is publicly deployed and usable.

## Run it

```bash
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/proof-of-ship$ anchor build
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/proof-of-ship$ anchor test --provider.cluster devnet
    Finished `release` profile [optimized] target(s) in 6.09s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 57.74s
     Running unittests src/lib.rs (/mnt/c/Users/T_fonsec/solana/proof-of-ship/target/debug/deps/proof_of_ship-b3705ebe91f322b0)
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: /home/t_fonsec/.config/solana/id.json
Deploying program "proof_of_ship"...
Program path: /mnt/c/Users/T_fonsec/solana/proof-of-ship/target/deploy/proof_of_ship.so...
Program ID: 2Xcaj4c6rKoXdsjw86bcjmXqfApVLwCS5V5y45oGXbRT
Deploy success

Found a 'test' script in the Anchor.toml. Running it as a test suite!

Running test suite: "/mnt/c/Users/T_fonsec/solana/proof-of-ship/Anchor.toml"

  proof-of-ship
    ✔ records your capstone on chain (579ms)
    ✔ only lets each wallet ship once (51ms)

  2 passing (640ms)

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/proof-of-ship$ solana balance --url devnet
14.316809793 SOL
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/proof-of-ship$ anchor program deploy \
--provider.cluster devnet \
-- --with-compute-unit-price 50000 --use-rpc
Deploying program: proof_of_ship
Program already exists, upgrading...
Sending upgrade transaction...
Signature: 3NzCVgfBgQB6aqy7bRYpQqLMMBiWhzj9R34RPF4PqmY3TXn83LikY6tVgDd9JuRxhAeN7oiBbt5k8mAsy7y5XhTU
Program ID: 2Xcaj4c6rKoXdsjw86bcjmXqfApVLwCS5V5y45oGXbRT

Writing metadata account...
 - metadata: 8YjSsqnmn1X44NkyqNvoBKz8bXEHHb4CMQzgEQBxqKr1
 - program: 2Xcaj4c6rKoXdsjw86bcjmXqfApVLwCS5V5y45oGXbRT
 - seed: idl

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/proof-of-ship$ anchor keys list
proof_of_ship: 2Xcaj4c6rKoXdsjw86bcjmXqfApVLwCS5V5y45oGXbRT
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/proof-of-ship$ solana program show 2Xcaj4c6rKoXdsjw86bcjmXqfApVLwCS5V5y45oGXbRT --url devnet

Program Id: 2Xcaj4c6rKoXdsjw86bcjmXqfApVLwCS5V5y45oGXbRT
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: A7EYuEE62SG4WC8dokj7wqPddsBBFtWmd8cAkkZDNQH9
Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
Last Deployed In Slot: 479863741
Data Length: 138496 (0x21d00) bytes
Balance: 0.96513624 SOL
```

Explorer view of the deployed program account (devnet):

```
Program Account
Address: 2Xcaj4c6rKoXdsjw86bcjmXqfApVLwCS5V5y45oGXbRT
Balance (SOL): 0.00114144
Executable: Yes
Executable Data: A7EYuEE62SG4WC8dokj7wqPddsBBFtWmd8cAkkZDNQH9
Upgradeable: Yes
Verified Build: Program Not Verified
Security.txt: Program has no security.txt
Last Deployed Slot: 479,863,741
Upgrade Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
```

The `ShipRecord` PDA this capstone actually shipped:

```json
{
  "address": "4NjFkMVLeyetJBrrAEcc6nuhssvU8tSzK5LgYGzepkCa",
  "builder": "DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A",
  "projectName": "Proof of Ship",
  "message": "Built in public, 100 days straight.",
  "shippedAt": "2026-07-30T01:24:53.000Z",
  "bump": 253
}
```
