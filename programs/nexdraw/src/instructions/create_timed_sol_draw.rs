use anchor_lang::prelude::*;

use crate::state::{Draw, DrawRegent, TicketInfo, TicketPrice, Timed, TimedParams};

#[derive(Accounts)]
pub struct CreateTimedSolDraw<'info> {
    #[account(
        init,
        space = Draw::size(0),
        payer = draw_manager,
        seeds = [b"draw".as_ref(), draw_regent.key().as_ref(), draw_regent.next_draw_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub draw: Account<'info, Draw>,

    ////////////////////////////////////////////////////////////////////////////
    // Auto derived below.
    ////////////////////////////////////////////////////////////////////////////
    #[account(mut)]
    pub draw_manager: Signer<'info>,

    #[account(
        seeds = [b"draw_regent".as_ref(), draw_manager.key.as_ref()],
        bump,
        has_one = draw_manager,
        mut,
    )]
    pub draw_regent: Account<'info, DrawRegent>,

    pub system_program: Program<'info, System>,
}

pub fn create_timed_sol_draw_handler(
    ctx: Context<CreateTimedSolDraw>,
    ticket_price: u64,
    timed_params: TimedParams,
) -> Result<()> {
    let draw_regent = &mut ctx.accounts.draw_regent;

    let draw = &mut ctx.accounts.draw;

    **draw = Draw::new_timed(
        draw_regent.key(),
        draw_regent.next_draw_id,
        Timed::new(timed_params)?,
        TicketInfo::new(TicketPrice::sol(ticket_price)),
    )?;

    draw_regent.next_draw_id += 1;
    draw_regent.draws_remaining -= 1;

    Ok(())
}
