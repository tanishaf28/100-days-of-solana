# Day 53: Auditing the Day 50 and Day 52 Mints

## Steps

1. Open the terminal and confirm the CLI is still pointed at devnet. If I switched clusters at any point, set it back before running anything else.
2. Find the two mint addresses from previous days. They were printed in the terminal when I ran `spl-token create-token`, and echoed by every follow-up command. If lost, scroll back through terminal history or check the wallet's devnet token list.
3. Run `spl-token display` against the Day 50 mint. The CLI auto-detects that this mint lives under the Token-2022 program and prints the mint authority, the decimals, the supply, and a section listing every configured extension.
4. Read the extensions block carefully. For the Day 50 mint I should see a `TransferFeeConfig` entry (with the basis points and maximum fee set).
5. Run `spl-token display` against the Day 52 mint. This is the stacked one.
6. Read this extensions block and confirm it has everything from the Day 50 mint plus an `InterestBearingConfig` entry showing the annual rate in basis points and the timestamp the rate was last updated.
7. In a text file, write one sentence per extension, in plain English, describing what that extension makes the mint do. Two sentences total. This is the reinforcement: forcing myself to articulate the behavior, not just recognize the label.
8. Take a screenshot of both display outputs side by side or stacked vertically, highlighting the extensions block on each.

## Run it

```bash
solana config set --url https://api.devnet.solana.com

spl-token display [YOUR_DAY_50_MINT_ADDRESS]

spl-token display [YOUR_DAY_52_MINT_ADDRESS]
```

## Terminal session

```text
PS C:\Users\T_fonsec\solana> wsl
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ solana config set --url https://api.devnet.solana.com
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json
Commitment: confirmed
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf

SPL Token Mint
  Address: 2ejQvE3cRejTEkJKG9RA7Fc4QBySXj28rAd52xGhaDdf
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 1001000000000
  Decimals: 6
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Transfer fees:
    Current fee: 100bps
    Current maximum: 1000000000000
    Config authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withdrawal authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
    Withheld fees: 0

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ spl-token display  HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B

SPL Token Mint
  Address: HFYq5H2NkPzJmcyQHUC9vfBMg94TM4fdrQYe8FSLPv6B
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 1000000000000
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
```

## What Just Happened

I just performed an audit of my own on-chain work, and that is a much bigger deal than it sounds. In Web2, the schema of a table lives in a database server that someone owns; I can read it only if I have credentials. On Solana, the configuration of a mint lives in a single account that anyone in the world can read at any time, forever, without asking permission. The `spl-token display` command is not querying a private API. It is reading the same bytes that a wallet, an exchange, or a hostile auditor would read, and decoding them through the public Token-2022 layout.

Looking back at what was on those two accounts: a transfer fee that the protocol enforces on every move, and an interest rate that the protocol compounds whether anyone is watching or not. Two extensions, two accounts, zero custom programs written by me. That is the whole pitch of Token-2022 sitting in the terminal output: behaviors that used to require custom smart contracts are now configuration flags on the mint, and the configuration is public, verifiable, and impossible to silently change.

The short reflection I wrote matters more than the screenshot. The day I can describe what each extension does without looking it up is the day this arc is genuinely mine.
