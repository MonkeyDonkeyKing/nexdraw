use anchor_lang::prelude::*;

use crate::state::{Draw, DrawRegent, DrawStatus, DrawType};

#[derive(Accounts)]
pub struct StartDraw<'info> {
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
    )]
    pub draw: Account<'info, Draw>,
}

pub fn start_draw_handler(ctx: Context<StartDraw>) -> Result<()> {
    let draw = &mut ctx.accounts.draw;
    matches!(draw.draw_info.status, DrawStatus::Concepting);

    let draw_type = &draw.draw_info.draw_type;
    let prizes = &draw.draw_info.prizes;

    // we only want to know the amount of prizes. On each prize add we already check for its validity and the continous pool prize validity.
    let total_prizes = prizes.prizes.len() as u32;

    // validate the draw type
    match draw_type {
        DrawType::Capped(_) => {
            panic!("Capped lotteries not supported yet");
        }
        DrawType::Timed(timed) => {
            timed.validate()?;
            require_gt!(timed.min_tickets_sold, total_prizes);
        }
    }
    draw.draw_info.status = DrawStatus::Live;

    Ok(())
}
