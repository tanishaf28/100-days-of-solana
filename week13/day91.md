# Day 91: Amplify, sharing the vault launch
**1/ Hook**
```
I just ran a full "mainnet launch" checklist... on devnet, on purpose,
before any of it touches real SOL.

Thread on what shipped and the one thing that broke that I didn't
expect 🧵
```

**2/ Context**
```
It's a vault program: deposit, withdraw, a PDA that signs for itself.
This week I took it through the whole launch sequence, deploy, take
deliberate control of the upgrade authority, publish the IDL, generate
a typed client with Codama, wire a React frontend through the Wallet
Standard.
```

**3/ One thing learned the hard way**
```
I'd already handled the failures I expected: rejected popup,
insufficient funds, expired blockhash. Then I disconnected the wallet
mid-send just to see what would happen, and it fell straight into my
own "unknown error" bucket.

Nothing exotic about it. I just hadn't written a check for it until I
went looking.
```

**4/ Proof + ask**
```
Here's the program, live on devnet, upgrade authority and all:
https://explorer.solana.com/address/GdueoRpuvMEw92rxhoVfJxdQcEoTaZUe15ow69WxPkPf?cluster=devnet

Try connecting a wallet to it, or just ask me anything about the
upgrade-authority dance. #100DaysOfSolana
```

**5/ Closing**
```
Mainnet is next. Full launch checklist write-up: https://dev.to/tanisha_fonseca/my-solana-launch-checklist-rehearsed-end-to-end-on-devnet-before-it-ever-touches-real-sol-1ll2

@solana_devs
```

Posted: https://x.com/tanishhaa_28/status/2082622989338562877?s=20
