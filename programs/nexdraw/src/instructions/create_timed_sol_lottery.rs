use anchor_lang::prelude::*;

use crate::state::{DrawRegent, Lottery, TimedParams, Timed, TicketPrice, TicketInfo};

#[derive(Accounts)]
pub struct CreateTimedSolLottery<'info> {
    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(mut)]
    pub draw_manager: Signer<'info>, 
    
    #[account(
        seeds = [b"draw_regent".as_ref(), draw_manager.key().as_ref()],
        bump,
        has_one = draw_manager,
        mut,
    )]
    pub draw_regent: Account<'info, DrawRegent>,

    #[account(
        init,
        space = Lottery::size(0),
        payer = draw_manager,
        seeds = [b"lottery".as_ref(), draw_regent.key().as_ref(), draw_regent.get_draw_id().to_le_bytes().as_ref()],
        bump
    )]
    pub lottery: Account<'info, Lottery>,

    pub system_program: Program<'info, System>,
}

pub fn create_timed_sol_lottery_handler(ctx: Context<CreateTimedSolLottery>, timed_params: TimedParams, ticket_price: u64) -> Result<()> {
    let draw_regent = &mut ctx.accounts.draw_regent;
    let lottery = &mut ctx.accounts.lottery;

    **lottery = Lottery::new_timed(
        draw_regent.key(),
        draw_regent.get_draw_id(),
        Timed::new(timed_params)?,
        TicketInfo::new(TicketPrice::sol(ticket_price)),
    )?;
    
    draw_regent.increase_draw_id();

    Ok(())
}