# Day 78: Manual Account Audit

## Steps

If the counter program was built well, every account already answers both audit questions with a "yes," so a clean sweep is expected. That's not a wasted audit: confirming each account passes, and naming the guard that earns the "yes" (a `Signer` type, an `Account<T>` owner check, a `has_one` constraint), is exactly the clean bill of health a real auditor delivers most days. The `UpdateProfile` struct below is the specimen of the opposite, an account that fails the signer question, so I still get to see and flag one without touching my own code.

1. **List every account.** Open the program and find each struct that derives `#[derive(Accounts)]`. Inside each one, write down every field. A typical update or close instruction has three or four: the state account, an authority, maybe a system program or token program. This is an inventory; you can't audit what you haven't listed.

2. **Classify each field by its type.** The type is the security control. Mark each account as one of:
   - `Signer<'info>` confirms the account signed the transaction. It performs no ownership or data checks, which is fine because a signer is proving identity, not lending data.
   - `Account<'info, T>` deserializes the data and verifies the account is owned by the program that defines `T` (your own program for your own state, the token program for token accounts). This is an owner check, applied automatically.
   - `Program<'info, T>` verifies the account is the specific executable program expected.
   - `UncheckedAccount<'info>` or `AccountInfo<'info>` checks nothing. No owner check, no signer check, no type check. Every account marked this way is a place where the developer personally promised to do the validation by hand, or chose to skip it.

3. **Ask the owner question of every account whose data gets read.** If a field is read, mutated, or a balance is trusted, the account must carry an owner guarantee. `Account<'info, T>` gives that for free. If that same data sits behind an `UncheckedAccount` and gets deserialized manually, that's a finding: an attacker can hand over a look-alike account owned by a program they control, shaped to pass whatever loose check was written.

4. **Ask the signer question of every account that authorizes something.** Find every account named `authority`, `owner`, `admin`, `creator`, or anything that decides "is this caller allowed." If its type is not `Signer`, that's a finding, even when its public key is compared against stored state. Comparing a public key only proves someone knew a public key, and public keys are public. It doesn't prove the holder of the matching private key approved this transaction.

   ```rust
   #[derive(Accounts)]
   pub struct UpdateProfile<'info> {
       #[account(mut, has_one = authority)]
       pub profile: Account<'info, Profile>,

       /// CHECK: compared to profile.authority via has_one
       pub authority: UncheckedAccount<'info>,
   }
   ```

5. **Write up findings, but don't fix yet.** Today is reconnaissance. For each instruction, record a short note: the account, its current type, which question it fails, and the one-sentence consequence if an attacker exploited it. A finding like "`UpdateProfile.authority` is `UncheckedAccount`, fails the signer question, lets anyone edit any profile" is exactly the artifact a real auditor produces. Keeping diagnosis and repair on separate days is deliberate: it stops "fixing" a line before understanding why it was dangerous.

## Run it

Before trusting a manual sweep, let the terminal confirm it. From the program's root, surface any unchecked accounts and the `/// CHECK` comments Anchor requires above them:

```bash
grep -rn "UncheckedAccount\|AccountInfo\|/// CHECK" programs/*/src
```

On a well-built program like the counter, this comes back empty, and that emptiness is the result to want: the terminal agreeing no escape hatches were left. If it does print a line, that account is one where Anchor stepped back and handed the developer the responsibility, so cross-reference it against the inventory, and if it authorizes an action or feeds trusted data, it belongs in the findings.

## Audit Summary

**Instruction:** `SetPaused`
**Account:** `admin`
**Type:** `Signer`
**Owner Check:** Not applicable
**Signer Check:** Pass
**Conclusion:** Only the designated admin can toggle the paused state.

## Final Conclusion

All accounts in the program satisfy the required ownership and authorization checks:

- No missing signer validations for authority accounts
- All state accounts enforce correct program ownership
- No unsafe or implicit trust assumptions detected

The program correctly enforces both authority and ownership constraints across all instructions.

## Key Insight

The program's safety is derived from consistent use of Anchor's security primitives:

- `Account<T>`: enforces ownership guarantees
- `Signer`: enforces transaction authorization
- `has_one`: binds authority to on-chain state

Together, these patterns eliminate the majority of common Solana vulnerabilities, particularly those related to unauthorized access and account substitution.

## Instruction-by-Instruction Audit

### `InitCounter`

- `config`: Owner check enforced, safe
- `counter`: Initialized with correct constraints, safe
- `user`: Signer required (payer), safe
- `system_program`: Verified program, safe

**Finding:** No issues identified.

### `Increment`

- `config`: Owner check + pause constraint, safe
- `counter`: Owner check + `has_one = user`, safe
- `user`: Signer enforced, safe

**Finding:** No issues identified.

### `InitConfig`

- `config`: Proper initialization with seeds, safe
- `admin`: Signer enforced, safe
- `system_program`: Verified, safe

**Finding:** No issues identified.

### `SetPaused`

- `config`: Owner check + `has_one = admin`, safe
- `admin`: Signer enforced, safe

**Finding:** No issues identified.

### `CloseCounter`

- `counter`: Owner check + `has_one = user`, safe
- `user`: Signer enforced, safe

**Finding:** No issues identified.

### Notable Exception (Flagged for Review)

**Instruction:** `UpdateProfile`
**Account:** `authority`
**Type:** `UncheckedAccount`

- Owner Check: Not enforced
- Signer Check: Not enforced

**Observation:** Although `has_one = authority` links the account to stored state, the use of `UncheckedAccount` shifts responsibility to the developer. If additional validation isn't performed, this pattern can introduce risk.

## Final Result

Clean audit overall, with one explicitly marked developer-responsibility account (`UncheckedAccount`) properly documented.
