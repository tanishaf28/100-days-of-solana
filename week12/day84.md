A missing owner check drained $326M from Wormhole. Last week I rebuilt that exact bug in a tiny Anchor program on my own machine, and watched it drain a fake vault in one green test.

Here are the 5 checks that stop it 🧵
Tanisha Fonseca
@tanishhaa_28
·
3s
❌ The bug: the program reads an account's data without checking who owns it. Anyone can hand you a forged account that deserializes perfectly.

✅ The fix: use a typed Account<'info, T> instead of UncheckedAccount. Anchor checks the owner before you read a field
Tanisha Fonseca
@tanishhaa_28
·
2s
❌ The bug: an instruction trusts a stored Pubkey as proof of identity. Comparing a key only proves someone knew it once, public keys are public.

✅ The fix: require the real caller with Signer<'info>, not just a field that happens to match.
Tanisha Fonseca
@tanishhaa_28
·
2s
The bug: nothing ties this specific account to this specific caller, so an attacker signs as themselves and hands in someone else's account.

✅ The fix: has_one = authority (or seeds + bump for a PDA) binds the account to the signer, checked before your handler runs.
Tanisha Fonseca
@tanishhaa_28
·
2s
The bug: balance -= amount on a value an attacker influences can wrap silently in a release build and hand out funds that don't exist.

✅ The fix: checked_sub / checked_add everywhere money moves, plus overflow-checks = true in your release profile.
Tanisha Fonseca
@tanishhaa_28
·
1s
The bug: one account type gets passed in where a different one is expected, and the handler trusts its shape.

✅ The fix: Anchor stamps an 8-byte discriminator on every #[account] type. Use typed accounts, not raw bytes, and the substitution gets rejected for you.
Tanisha Fonseca
@tanishhaa_28
·
1s
I ran this exact bug against a forged account and watched the exploit succeed, then changed one type and watched it get rejected.

https://dev.to/tanisha_fonseca/the-solana-security-checklist-i-wish-id-had-before-i-reproduced-the-wormhole-bug-myself-2114

Bookmark it before your next mainnet deploy.

#100DaysOfSolana

Posted: https://x.com/tanishhaa_28/status/2082275494246953140?s=20