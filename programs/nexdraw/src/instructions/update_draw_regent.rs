use crate::{DrawRegent, Emperor};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(regent_key: Pubkey)]
pub struct UpdateDrawRegent<'info> {
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
        seeds = [b"draw_regent".as_ref(), regent_key.to_bytes().as_ref()],
        bump
    )]
    pub draw_regent: Account<'info, DrawRegent>,
}


pub fn update_draw_regent_handler(ctx: Context<UpdateDrawRegent>, remaining_draws: Option<u32>, emperor_percent_commission: Option<u16>) -> Result<()> {
    let draw_regent = &mut ctx.accounts.draw_regent;
    draw_regent.try_update(remaining_draws, emperor_percent_commission)
}