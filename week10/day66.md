# Day 66: Adding a Config singleton PDA and pause functionality

## Yesterday's program (what I have now)

```text
User Wallet
     |
     |
     v
Counter PDA
(seeds: ["counter", user])
     |
     |
 count = 5
```

Each user has their own counter.

## Today's upgrade

I'm adding a Config PDA:

```text
             Config PDA
          seeds: ["config"]
                |
                |
        ----------------
        |              |
      admin        paused=false
                     |
                     |
             total_counters=2


User A --> Counter PDA
            count=3


User B --> Counter PDA
            count=7
```

The Config PDA is a singleton. There is only one for the whole program.

## Where I need to add things

I only modify:

```text
counter/
│
├── programs/
│   └── counter/
│       └── src/
│           └── lib.rs       <-- MAIN CHANGES HERE
│
└── tests/
    └── counter.ts           <-- REPLACE THIS FILE
```

## Steps

1. **Add the Config struct.** Open:

   ```bash
   nano programs/counter/src/lib.rs
   ```

   Find my existing:

   ```rust
   #[account]
   #[derive(InitSpace)]
   pub struct Counter {
   ```

   Above or below it, add:

   ```rust
   #[account]
   #[derive(InitSpace)]
   pub struct Config {
       pub admin: Pubkey,
       pub paused: bool,
       pub total_counters: u64,
       pub bump: u8,
   }
   ```

2. **Add a Paused error.** I currently have:

   ```rust
   pub enum CounterError {
       Overflow,
   }
   ```

   Change it to:

   ```rust
   pub enum CounterError {
       #[msg("counter overflow")]
       Overflow,

       #[msg("Increments are currently paused")]
       Paused,
   }
   ```

3. **Add an `init_config` instruction.** Inside:

   ```rust
   #[program]
   pub mod counter {
   ```

   I currently have `pub fn init_counter(...)` and `pub fn increment(...)`. Add:

   ```rust
   pub fn init_config(ctx: Context<InitConfig>) -> Result<()> {
       let config = &mut ctx.accounts.config;

       config.admin = ctx.accounts.admin.key();
       config.paused = false;
       config.total_counters = 0;
       config.bump = ctx.bumps.config;

       Ok(())
   }
   ```

   Then below the other Accounts structs, add:

   ```rust
   #[derive(Accounts)]
   pub struct InitConfig<'info> {
       #[account(
           init,
           payer = admin,
           space = 8 + Config::INIT_SPACE,
           seeds = [b"config"],
           bump
       )]
       pub config: Account<'info, Config>,

       #[account(mut)]
       pub admin: Signer<'info>,

       pub system_program: Program<'info, System>,
   }
   ```

4. **Modify `InitCounter`** to include the config account. My current:

   ```rust
   pub struct InitCounter<'info> {
   ```

   becomes:

   ```rust
   pub struct InitCounter<'info> {

       #[account(
           mut,
           seeds = [b"config"],
           bump = config.bump,
       )]
       pub config: Account<'info, Config>,


       #[account(
           init,
           payer = user,
           space = 8 + Counter::INIT_SPACE,
           seeds = [b"counter", user.key().as_ref()],
           bump
       )]
       pub counter: Account<'info, Counter>,


       #[account(mut)]
       pub user: Signer<'info>,


       pub system_program: Program<'info, System>,
   }
   ```

   Then update `init_counter`. Before:

   ```rust
   counter.bump = ctx.bumps.counter;
   ```

   After:

   ```rust
   counter.bump = ctx.bumps.counter;

   let config = &mut ctx.accounts.config;

   config.total_counters =
       config.total_counters.checked_add(1).unwrap();
   ```

5. **Add pause functionality.** Inside the program module, add:

   ```rust
   pub fn set_paused(
       ctx: Context<SetPaused>,
       paused: bool
   ) -> Result<()> {

       ctx.accounts.config.paused = paused;

       Ok(())
   }
   ```

   And add:

   ```rust
   #[derive(Accounts)]
   pub struct SetPaused<'info> {

       #[account(
           mut,
           seeds=[b"config"],
           bump=config.bump,
           has_one=admin,
       )]
       pub config: Account<'info, Config>,

       pub admin: Signer<'info>,
   }
   ```

6. **Update Increment.** My current `increment` only checks the counter PDA. Replace the Accounts struct with:

   ```rust
   #[derive(Accounts)]
   pub struct Increment<'info> {

       #[account(
           seeds=[b"config"],
           bump=config.bump,
           constraint=!config.paused @ CounterError::Paused,
       )]
       pub config: Account<'info, Config>,


       #[account(
           mut,
           seeds=[b"counter", user.key().as_ref()],
           bump=counter.bump,
           has_one=user,
       )]
       pub counter: Account<'info, Counter>,


       pub user: Signer<'info>,
   }
   ```

7. **Replace the test.** Open:

   ```bash
   nano tests/counter.ts
   ```

   Delete everything, and paste in the new test from the instructions.

8. **Run it.** First:

   ```bash
   anchor build
   ```

   Then:

   ```bash
   anchor test --skip-local-validator
   ```

   (I already have my validator running manually, so I use this.)

## Expected output

```text
counter with config

 ✔ initializes config and a counter, then increments
 ✔ refuses to increment when paused

2 passing
```
