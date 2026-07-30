use anchor_lang::prelude::*;

declare_id!("85Aotpa2hZW7WtzZ6w67RnsfBcpqpgV22M3vkMpS3UbA");

#[program]
pub mod leaky_vault {
    use super::*;

    pub fn withdraw(ctx: Context<Withdraw>, _amount: u64) -> Result<()> {
        // VULNERABLE: we read this account's bytes without ever checking
        // who owns it. Anything that deserializes is treated as our Config.
        let data = ctx.accounts.config.try_borrow_data()?;
        let config = Config::try_deserialize(&mut &data[..])?;

        require_keys_eq!(
            config.admin,
            ctx.accounts.signer.key(),
            VaultError::Unauthorized
        );

        // Real withdraw logic would move lamports here. For the experiment,
        // reaching this line at all is the exploit: auth has been bypassed.
        msg!("withdraw authorized for {}", ctx.accounts.signer.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    /// CHECK: deserialized by hand below, with no owner check. This is the bug.
    pub config: UncheckedAccount<'info>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[account]
pub struct Config {
    pub admin: Pubkey,
}

#[error_code]
pub enum VaultError {
    #[msg("signer is not the admin")]
    Unauthorized,
}