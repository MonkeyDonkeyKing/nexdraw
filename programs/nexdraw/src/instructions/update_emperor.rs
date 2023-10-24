use crate::Emperor;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateEmperor<'info> {
    ////////////////////////////////////////////////////////////////////////////
    /// Auto derived below.
    /// ////////////////////////////////////////////////////////////////////////
    
    #[account(
        mut,
        seeds = [b"emperor".as_ref()],
        bump,
        has_one = authority,
    )]
    pub emperor: Account<'info, Emperor>,
    #[account(mut)]
    pub authority: Signer<'info>,
}


pub fn update_emperor_handler(ctx: Context<UpdateEmperor>, new_auhtority: Pubkey) -> Result<()> {
    let emperor = &mut ctx.accounts.emperor;
    emperor.update_authority(new_auhtority)?;
    Ok(())
}