# Day 52: Stacking Transfer Fee and Interest Bearing on One Mint

Mint: `HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B`
Token account: `B3xd2y8GouNoEGHNg6bwx4YEQU2RkrRzZWhN2FEzMFec`

## Steps

1. Confirm the environment is healthy. I should be on devnet and have a balance that covers a couple of rent-exempt accounts.
2. Create a brand new mint that combines two extensions in a single invocation. The `--transfer-fee-basis-points` flag sets the fee rate and `--transfer-fee-maximum-fee` sets the maximum raw fee per transfer. The `--interest-rate` flag takes a single integer in basis points, where 10000 basis points equals 100 percent APR. To make the interest visible inside one coffee break, I used an unrealistically high rate.
3. Display the mint and read every line of the output. I should see `TransferFeeConfig` AND `InterestBearingConfig` populated, confirming both extensions made it onto the same TLV (type-length-value) blob inside the mint account.
4. Create an associated token account for myself on the new mint, then mint a generous supply so the interest math produces visible digits.
5. Run `spl-token accounts` on my token account and write down the UI amount. Wait roughly 30 seconds. Run it again. Write down the new UI amount. The numbers should be different even though I have not sent a transaction in between.
6. Move some tokens. Generate a fresh keypair, fund it with a tiny amount of SOL from my wallet, and transfer a chunk of my token supply to it. Use the `--expected-fee` flag the same way as Day 51 so the transfer instruction acknowledges the fee.
7. Display the recipient's token account. Confirm two things at once: first, the fee was withheld on the recipient side, exactly like it did on Day 51; second, the recipient's UI amount is already drifting upward because the interest-bearing extension applies to every account on the mint, not just mine.
8. As a final check, withdraw the withheld fees back to my wallet using the same `withdraw-withheld-tokens` flow from yesterday, confirming the mint authority still works on a multi-extension mint.

## Terminal session

```text
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana config set --url https://api.devnet.solana.com
solana balance
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json
Commitment: confirmed
13.82592552 SOL
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-token \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --decimals 6 \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 1000000 \
  --interest-rate 5000
Creating token HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B
Decimals:  6

Signature: VFLqMtjrGAhEsjtHrK3dUAKBuSJNtGJf5EyxE6S23NPCVt6vkH9csFTV4PmfQPeiiJxYNhvP5BFPbZNDNscj5UK

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ export MINT=HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display $MINT

SPL Token Mint
  Address: HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 0
  Decimals: 6
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Interest-bearing:
    Current rate: 5000bps
    Average rate: 5000bps
    Rate authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Transfer fees:
    Current fee: 100bps
    Current maximum: 1000000000000
    Config authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withdrawal authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withheld fees: 0

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account $MINT
Creating account B3xd2y8GouNoEGHNg6bwx4YEQU2RkrRzZWhN2FEzMFec

Signature: G8ovqSrdKybbtoiM4ZXMvxMJvUnpCbMw7YdCK3zcmm15jN9aRRgQyYbgU57o7BDHkVtk8uhhEMdZkAsCXyhJC2L

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ export MY_TA=B3xd2y8GouNoEGHNg6bwx4YEQU2RkrRzZWhN2FEzMFec
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token mint $MINT 1000000
Minting 1000000 tokens
  Token: HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B
  Recipient: B3xd2y8GouNoEGHNg6bwx4YEQU2RkrRzZWhN2FEzMFec

Signature: 2W6rPaECxR7LvQ4cHMbuaGUvHoa7m821CV1ec7rDpRnnFMzRGhZ8AbS2aBSKRKFTP5kbF7afDxnmxBjcc79qd8R3

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token accounts $MINT --verbose | awk 'NR==3'
sleep 30
spl-token accounts $MINT --verbose | awk 'NR==3'
TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb   B3xd2y8GouNoEGHNg6bwx4YEQU2RkrRzZWhN2FEzMFec                              1000001.029892
TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb   B3xd2y8GouNoEGHNg6bwx4YEQU2RkrRzZWhN2FEzMFec                              1000001.505227
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana-keygen new --no-bip39-passphrase --outfile ~/recipient.json
RECIPIENT=$(solana-keygen pubkey ~/recipient.json)
solana transfer $RECIPIENT 0.01 --allow-unfunded-recipient
Generating a new keypair
Wrote new keypair to /home/t_fonsec/recipient.json
==============================================================================
pubkey: 62qWZ9DmAQdXtU3eGSWMJRCnLDiEf513BWzR8vPzsTLH
==============================================================================
Save this seed phrase to recover your new keypair:
wheel laptop opinion universe belt audit slab misery until hurry cradle parrot
==============================================================================

Signature: 27U28V5hSs83i9B9mXr5AHPXqoMgKoqwoxTS1GkCzaanLcbkde7PmkYRKBhTXYLayaj5R4FiksxdEJsYB2ZeSnQB

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token create-account $MINT --owner $RECIPIENT --fee-payer ~/.config/solana/id.json
Creating account 7qRgXHPP8k9NNgPSJkDCBbU24ofRWp3WAcyyPqeWgUgk

Signature: 4KhYvK8Saocsg4vuMrXfCCKwDWv9NmTvZF1DJ8Cj6hjFuxLGaJCm1jgxfGVQRGaaNNBF5hnCbjd3y9PankDdvHio

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ export RECIPIENT_TA=7qRgXHPP8k9NNgPSJkDCBbU24ofRWp3WAcyyPqeWgUgk
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token transfer $MINT 1000 $RECIPIENT \
  --expected-fee 10
Transfer 1000 tokens
  Sender: B3xd2y8GouNoEGHNg6bwx4YEQU2RkrRzZWhN2FEzMFec
  Recipient: 62qWZ9DmAQdXtU3eGSWMJRCnLDiEf513BWzR8vPzsTLH
  Recipient associated token account: 7qRgXHPP8k9NNgPSJkDCBbU24ofRWp3WAcyyPqeWgUgk

Signature: 4zL4i3qK49r6N31yyWoZ9nLWukbcUZ4BgQ6qtSv1svGyGsZtcQwsyeKKygXqMhmQ7BNmeVUFYZihdgTp9AqG1VXb

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display $RECIPIENT_TA

SPL Token Account
  Address: 7qRgXHPP8k9NNgPSJkDCBbU24ofRWp3WAcyyPqeWgUgk
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Balance: 990
  Decimals: 6
  Mint: HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B
  Owner: 62qWZ9DmAQdXtU3eGSWMJRCnLDiEf513BWzR8vPzsTLH
  State: Initialized
  Delegation: (not set)
  Close authority: (not set)
Extensions:
  Immutable owner
  Transfer fees withheld: 10000000

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token withdraw-withheld-tokens $MY_TA $RECIPIENT_TA

Signature: 4xk5ijLjuFdP4nzfzUNjaLYZjPZpTkmscZEJPyDhWPjXCisAVyVFZmoSttxrqLjsm8vimmybHe5q9QEVrrJJZfAq
```

The balance went from `1000001.029892` to `1000001.505227` over 30 seconds without any transaction being sent, confirming the interest-bearing extension recalculates the displayed UI amount on read rather than minting new tokens.
