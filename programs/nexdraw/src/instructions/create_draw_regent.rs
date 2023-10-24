use crate::{DrawRegent, Emperor};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(regent_key: Pubkey)]
pub struct CreateDrawRegent<'info> {
    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    
    #[account(
        has_one = authority,
        seeds = [b"emperor".as_ref()],
        bump
    )]
    pub emperor: Account<'info, Emperor>,
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        space = DrawRegent::SIZE,
        payer = authority,
        seeds = [b"draw_regent".as_ref(), regent_key.to_bytes().as_ref()],
        bump
    )]
    pub draw_regent: Account<'info, DrawRegent>,

    pub system_program: Program<'info, System>,
}


pub fn create_draw_regent_handler(ctx: Context<CreateDrawRegent>, regent_key: Pubkey, draws_permitted: u32, emperor_percent_commission: u16) -> Result<()> {
    let draw_regent = &mut ctx.accounts.draw_regent;
    **draw_regent = DrawRegent::try_new(
        regent_key,
        draws_permitted,
        emperor_percent_commission,
    )?;
    Ok(())
}