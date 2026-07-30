t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/vault$ solana config set --url devnet
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com 
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json 
Commitment: confirmed 
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/vault$ solana program show  GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf

Program Id: GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: 61UVAVy9u33vBKNhS4MZJsgEQKA2zWzZsdgvxSmgcFLg
Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
Last Deployed In Slot: 479630308
Data Length: 151536 (0x24ff0) bytes
Balance: 1.05589464 SOL

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/vault$ solana-keygen new --no-bip39-passphrase --outfile new-authority.json
Generating a new keypair
Wrote new keypair to new-authority.json
================================================================================
pubkey: 3WtZc1TAKyuyyPhBiCYHse8FmQJDqYahoCdLwW2nWC4t
================================================================================
Save this seed phrase to recover your new keypair:
pepper copper tuna gadget predict umbrella jelly robot meat taste vehicle muffin
================================================================================
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/vault$ solana program set-upgrade-authority GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf \
  --new-upgrade-authority new-authority.json
Account Type: Program
Authority: 3WtZc1TAKyuyyPhBiCYHse8FmQJDqYahoCdLwW2nWC4t

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/vault$ solana program show GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf

Program Id: GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: 61UVAVy9u33vBKNhS4MZJsgEQKA2zWzZsdgvxSmgcFLg
Authority: 3WtZc1TAKyuyyPhBiCYHse8FmQJDqYahoCdLwW2nWC4t
Last Deployed In Slot: 479630308
Data Length: 151536 (0x24ff0) bytes
Balance: 1.05589464 SOL

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/vault$ solana program set-upgrade-authority GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf \
  --upgrade-authority new-authority.json \
  --new-upgrade-authority ~/.config/solana/id.json
Account Type: Program
Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/vault$ solana program show GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf

Program Id: GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: 61UVAVy9u33vBKNhS4MZJsgEQKA2zWzZsdgvxSmgcFLg
Authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
Last Deployed In Slot: 479630308
Data Length: 151536 (0x24ff0) bytes
Balance: 1.05589464 SOL

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/vault$ 

The challenge
You will practice the entire authority lifecycle on devnet, where mistakes are free, using your vault program. Everything you learn maps one-to-one onto the mainnet program from yesterday. The only difference is that on mainnet you will run these commands once, slowly, and with a second person watching.

What you’ll need
The Solana CLI (this guide assumes solana-cli 3.1.x) and the Anchor CLI from the earlier arcs.
Your vault program, already deployed to devnet as the staging step in Day 85, and its program ID.
A dedicated devnet RPC endpoint (free tier from Helius or QuickNode) only if you do the optional program upgrade in step 3 — that step is a full redeploy, and the public devnet RPC cannot reliably complete one. The authority-transfer commands are single transactions and run fine on the public --url devnet. Quote the endpoint URL wherever you use it (the ? is a shell glob character).
Your terminal, with your default keypair funded on devnet (use solana airdrop 2 --url devnet if your balance is low).
About 30 minutes and a willingness to read each command’s output before running the next one.
Steps
Two different things share the word “upgrade” today, and keeping them separate is the whole trick. Upgrade authority is who may change the program — moving it is a single command. A program upgrade is deploying new bytecode — a separate action only the authority holder can do. You will demonstrate the program upgrade first, while you still hold authority (so it is trivial), then spend the rest of the day moving that authority around.

Point the CLI at devnet. Every command below talks to the devnet copy you deployed in Day 85.
solana config set --url devnet

Read who holds the authority right now. The Authority field is your default wallet — the key that signed the deploy. You will watch this field change as you move authority around.
solana program show [YOUR_PROGRAM_ID]

(Optional) Prove the upgrade mechanism while you still hold authority. A program upgrade replaces the bytecode, and only the upgrade authority can do it. Doing it now, before you transfer anything, keeps it a single signer: your default wallet is both the fee payer and the authority, so it just works. (This redeploys the same vault.so and costs a little buffer rent — skip it if you would rather not spend the SOL; it does not affect the authority steps.)
anchor program upgrade [YOUR_PROGRAM_ID] \
  --program-filepath target/deploy/vault.so \
  --provider.cluster "[your-devnet-endpoint]"

Two things to notice: anchor program upgrade takes the program ID as a positional argument and the .so as --program-filepath (the reverse of the deprecated anchor upgrade), and --provider.cluster points it at devnet — without it, Anchor uses Anchor.toml’s cluster and you get AccountNotFound. Because a program upgrade is a full redeploy, this is the one step that needs your dedicated RPC endpoint.

Create a throwaway key to hand authority to. On devnet this stands in for a teammate’s key or a multisig.
solana-keygen new --no-bip39-passphrase --outfile new-authority.json

Transfer the upgrade authority to it. This is the actual operation the day is named for — one command, signed by the current authority (your default wallet).
solana program set-upgrade-authority [YOUR_PROGRAM_ID] \
  --new-upgrade-authority new-authority.json

Confirm it moved. Re-read the program; the Authority field is now the new key. From this moment your default wallet can no longer upgrade the program — only new-authority.json can, and it would also have to be funded to pay for a buffer. That is exactly why the optional upgrade in step 3 came first.
solana program show [YOUR_PROGRAM_ID]

Transfer it back. Reversing the move is the same command, now signed by the new authority. Note the recipient is your default wallet’s keypair file, not its pubkey: a transfer requires the new authority to sign too (proof it can control the program), so passing a bare address fails with missing signature for supplied pubkey.
solana program set-upgrade-authority [YOUR_PROGRAM_ID] \
  --upgrade-authority new-authority.json \
  --new-upgrade-authority ~/.config/solana/id.json

(Transferring to a key you cannot sign with here — a multisig, say — instead takes --skip-new-upgrade-authority-signer. Squads’ “Safe Authority Transfer” exists precisely to make that case safe.)

The one-way door (do not run casually). --final removes the authority entirely and makes the program permanently immutable. There is no undo, on any cluster. Only ever run this on a program you intend to freeze for good.
# Irreversible. Only ever run this on a program you intend to freeze for good.
solana program set-upgrade-authority [YOUR_PROGRAM_ID] --final
