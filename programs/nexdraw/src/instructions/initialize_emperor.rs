use crate::Emperor;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeEmperor<'info> {    
    #[account(mut)]
    /// the account that will pay for the transaction 
    /// and the future authority of the emperor account
    pub payer: Signer<'info>,
    #[account(
        init,
        space = Emperor::SIZE,
        payer = payer,
        seeds = [b"emperor".as_ref()],
        bump
    )]
    /// the emperor account that is to be initialized
    pub emperor: Account<'info, Emperor>,

    pub system_program: Program<'info, System>,
}


pub fn initialize_emperor_handler(ctx: Context<InitializeEmperor>) -> Result<()> {
    let emperor = &mut ctx.accounts.emperor;
    **emperor = Emperor::new(ctx.accounts.payer.key());
    Ok(())
}