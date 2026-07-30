Steps
Build a fresh release artifact. Run anchor build so target/deploy/ holds the current .so file and the program keypair. Never deploy a stale build to mainnet; rebuild so the bytecode you ship is exactly the code you just reviewed.
Sync your program ID. Run anchor keys sync. This makes the declare_id! in your program match the actual keypair in target/deploy/vault-keypair.json. If anchor keys sync changes anything, run anchor build once more so the embedded ID and the artifact agree. A mismatch here is the single most common first-deploy failure.
Measure the rent before you spend it. The bulk of your deploy cost is rent that keeps the program account rent-exempt, and it scales with the byte size of your .so. Preview it with the command in “Run it” below. This number, plus a small margin for transaction fees, is what your wallet must hold.
Point the Solana CLI at mainnet and check your wallet. Run solana config set --url mainnet-beta, then solana balance. Confirm the balance comfortably exceeds the rent figure from the previous step. There is no solana airdrop on mainnet; if you are short, fund the wallet now.
Tell Anchor to use mainnet. In Anchor.toml, set the provider block so deploys target mainnet and use your funded keypair:
[provider]
cluster = "Mainnet"
wallet = "~/.config/solana/id.json"

Point wallet at the keypair that actually holds your SOL. Whatever keypair signs this deploy becomes the program’s upgrade authority, so choose deliberately.

Deploy with a priority fee. Mainnet is busy, and a deploy is many transactions in a row. Adding a compute-unit price makes each one far more likely to land before its blockhash expires. Use the deploy command in “Run it” below.
Confirm what landed. Run solana program show [your-program-id] and read it back: the program ID, the upgrade authority, the data length, and the balance. Then open the same address on Solana Explorer with the cluster set to Mainnet and confirm your program appears as an upgradeable program.