use crate::Emperor;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeEmperor<'info> {
    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(
        init,
        space = Emperor::SIZE,
        payer = payer,
        seeds = [b"emperor".as_ref()],
        bump
    )]
    pub emperor: Account<'info, Emperor>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}


pub fn initialize_emperor_handler(ctx: Context<InitializeEmperor>) -> Result<()> {
    let emperor = &mut ctx.accounts.emperor;
    **emperor = Emperor::new(ctx.accounts.payer.key());
    Ok(())
}