# Day 36: Interest-Bearing Tokens

- Mint addr: 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk
- Token acc: 6ViX7aqtWcqPsotEW9knF5Fsz6icS4eHobbEHGTvgTS

Created a Token-2022 mint with the interest-bearing extension, minted supply, and then changed the interest rate as the rate authority.

## Terminal Session

```text
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana$ cd week6
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$ solana config get
Config File: /home/t_fonsec/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com 
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/t_fonsec/.config/solana/id.json 
Commitment: confirmed 
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$ solana balance
13.88300128 SOL
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$ spl-token create-token \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --interest-rate 500
Creating token 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk
Decimals:  9

Signature: 5ziZNqYWyQ1U6JQ3Q4NA7va2RnjdGU3zAdo8s9qLep9b4nNbax79dp9h9nQFQ8mB37N15EAuiPEr6exVP2y1sois

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$ spl-token create-account 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk\
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
Creating account 6ViX7aqtWcqPsotEW9knF5Fsz6icS4eHobbEHGTvgTS

Signature: 5reER5n1Dm4iknfGjQWk56GpT2GU47fmwBGfpuNL6a8KFMzX7Qxqn85B5AGXsrNuUavNN7jjppuUkcyK2ZyZ9RDt

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$ spl-token mint 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk 1000\
>   --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
Minting 1000 tokens
  Token: 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk
  Recipient: 6ViX7aqtWcqPsotEW9knF5Fsz6icS4eHobbEHGTvgTS

Signature: 3VfNcyn53Za17S84UsNPUoi8cpY8KQuWmVs2Q4dKdLv7hbhHNByvkZXhDeGDxLHqAMYxmLdPNdQjvJF6wMUuvPxQ

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$ spl-token balance  7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
1000.00018538

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$ spl-token display 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk  \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

SPL Token Mint
  Address: 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 1000000000000
  Decimals: 9
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Interest-bearing:
    Current rate: 500bps
    Average rate: 500bps
    Rate authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$ solana account 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk --output json
{
  "pubkey": "7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk",
  "account": {
    "lamports": 2436000,
    "data": [
      "AQAAALW1LENXPf2l+QoXPcZiK/EDKUe+20ZtAL1TeUiNycTrABCl1OgAAAAJAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQoANAC1tSxDVz39pfkKFz3GYivxAylHvttGbQC9U3lIjcnE6xdcRWoAAAAA9AEXXEVqAAAAAPQB",
      "base64"
    ],
    "owner": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    "executable": false,
    "rentEpoch": 18446744073709551615,
    "space": 222
  }
}
t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$ spl-token set-interest-rate 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk 15000
Setting Interest Rate for 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk to 15000 bps

Signature: 4tzuV7e7ejqcu25zS21PuK1htssCGbuja7YWWSoenRdaY5fZPNckgnD7EbMAbV2qtFSg4r63DrYvMHb6wsaGixDS

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$ spl-token display 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk  \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

SPL Token Mint
  Address: 7Vxua7cCDz7vs9HinN2n2A2zbxnogqrh3tC5nTKwRNYk
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Supply: 1000000000000
  Decimals: 9
  Mint authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A
  Freeze authority: (not set)
Extensions
  Interest-bearing:
    Current rate: 15000bps
    Average rate: 500bps
    Rate authority: DEK2N9e57ceFeBvEXaf8ToCSdVN431tyPDaxy8BUUJ8A

t_fonsec@openstack:/mnt/c/Users/T_fonsec/solana/week6$
```

The `--interest-rate 500` flag set an initial 5% (500bps) continuous compounding rate on the mint, which is why the balance already showed as `1000.00018538` instead of a flat `1000` right after minting. Using `spl-token set-interest-rate` to bump the rate to 15000bps (150%) changed the current rate while the average rate stayed at 500bps, since the average is a time-weighted figure that only shifts gradually.
