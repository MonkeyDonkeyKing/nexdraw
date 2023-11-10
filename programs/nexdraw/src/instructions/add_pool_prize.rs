use anchor_lang::prelude::*;

use crate::state::{Draw, DrawRegent, DrawStatus, Prize};

#[derive(Accounts)]
pub struct AddPoolPrize<'info> {
    /*
       Draw details
    */
    #[account(mut)]
    pub draw_manager: Signer<'info>,
    #[account(mut, has_one = draw_manager)]
    pub draw_regent: Account<'info, DrawRegent>,
    #[account(
        mut,
        has_one = draw_regent,
        realloc = Draw::size(draw.draw_info.prizes.len() + 1),
        realloc::payer = draw_manager,
        realloc::zero = false,
    )]
    pub draw: Account<'info, Draw>,
    /*
        Programs
    */
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn add_pool_prize_handler(ctx: Context<AddPoolPrize>, percentage: u16) -> Result<()> {
    let draw = &mut ctx.accounts.draw;
    matches!(draw.draw_info.status, DrawStatus::Concepting);
    draw.draw_info
        .prizes
        .add_prize(&Prize::Percentage { value: percentage });

    Ok(())
}
