use crate::{DrawRegent, Emperor};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateDrawRegent<'info> {
    #[account(mut)]
    pub draw_regent: Account<'info, DrawRegent>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(
        has_one = authority,
        seeds = ["emperor".as_bytes()],
        bump
    )]
    pub emperor: Account<'info, Emperor>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn update_draw_regent_handler(
    ctx: Context<UpdateDrawRegent>,
    updated_draws_left: Option<u32>,
    emperor_percent_commission: Option<u16>,
) -> Result<()> {
    let draw_regent = &mut ctx.accounts.draw_regent;
    draw_regent.try_update(updated_draws_left, emperor_percent_commission)
}
