use anchor_lang::prelude::*;

use crate::{
    state::{Draw, DrawStatus, DrawType},
    NexdrawErrors,
};

#[derive(Accounts)]
#[instruction(ticket_id: u32)]
pub struct BuyTicket<'info> {
    #[account(mut, constraint = draw.draw_info.status == DrawStatus::Live)]
    pub draw: Account<'info, Draw>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn buy_ticket_handler(ctx: Context<BuyTicket>, ticket_id: u32) -> Result<()> {
    let tickets_sold: u32 = ctx.accounts.draw.ticket_info.sold;
    let max_ticket_id = if tickets_sold * 2 < 100 {
        100
    } else {
        tickets_sold * 2
    };
    require_gte!(max_ticket_id, ticket_id, NexdrawErrors::ExceedMaxTicketId);

    Ok(())
}
