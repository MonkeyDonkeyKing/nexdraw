use anchor_lang::prelude::*;

use crate::{state::{DrawRegent, Draw, TimedParams, Timed, TicketPrice, TicketInfo}, instruction};

#[derive(Accounts)]
#[instruction(ticket_price: u64, timed_params: TimedParams, id: u32)]
pub struct CreateTimedSolDraw<'info> {
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

    #[account(
        init,
        space = Draw::size(10),
        payer = draw_manager,
        seeds = [b"draw".as_ref(), draw_regent.key().as_ref(), &id.to_le_bytes().as_ref()],
        bump,
        constraint = draw_regent.next_draw_id.to_le_bytes().as_ref() == id.to_le_bytes().as_ref() 
    )]
    pub draw: Account<'info, Draw>,

    pub system_program: Program<'info, System>,
}

pub fn create_timed_sol_draw_handler(ctx: Context<CreateTimedSolDraw>,ticket_price: u64, timed_params: TimedParams, id: u32) -> Result<()> {
    let draw_regent = &mut ctx.accounts.draw_regent;
    

    let draw = &mut ctx.accounts.draw;

    **draw = Draw::new_timed(
        draw_regent.key(),
        draw_regent.next_draw_id,
        Timed::new(timed_params)?,
        TicketInfo::new(TicketPrice::sol(ticket_price)),
    )?;
    
    draw_regent.next_draw_id += 1;

    Ok(())
}