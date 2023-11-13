use std::collections::HashSet;

use anchor_lang::prelude::*;
use solana_program::sysvar;

use crate::{
    state::{Capped, Draw, DrawStatus, DrawType, Timed, VerificationStruct},
    NexdrawErrors,
};

#[derive(Accounts)]
pub struct DrawWinners<'info> {
    /*
       Draw details
    */
    #[account(
        mut,
        constraint = draw.draw_info.status == DrawStatus::Live,
        seeds = [
            "draw".as_bytes(),
            draw.draw_regent.key().as_ref(),
            draw.draw_id.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub draw: Account<'info, Draw>,

    #[account(
        init,
        payer = payer,
        space = VerificationStruct::size(calculate_space(&draw).try_into().unwrap()),
        seeds = [
            "verification".as_bytes(),
            draw.key().as_ref(),
        ],
        bump,
    )]
    pub verification_account: Account<'info, VerificationStruct>,
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    #[account(address = sysvar::slot_hashes::id())]
    /// CHECK:
    recent_slothashes: UncheckedAccount<'info>,
}

impl<'info> DrawWinners<'info> {}

pub fn draw_winners_handler(ctx: Context<DrawWinners>) -> Result<()> {
    {
        // checks if enough tickets have been sold
        let draw = &ctx.accounts.draw;
        let tickets_sold = draw.draw_info.ticket_info.sold;
        require_gt!(
            tickets_sold,
            draw.draw_info.prizes.len() as u32,
            NexdrawErrors::NotEnoughTicketsSold
        );
    }
    {
        match &ctx.accounts.draw.draw_info.draw_type {
            DrawType::Capped(capped) => {
                panic!("Capped draws not yet implemented")
            }
            DrawType::Timed(timed) => {
                let current_time = Clock::get()?.unix_timestamp;
                require_gte!(current_time, timed.end_time, NexdrawErrors::DrawTimeNotOver);
                require_gte!(
                    &ctx.accounts.draw.draw_info.ticket_info.sold,
                    &timed.min_tickets_sold,
                    NexdrawErrors::DrawTimeNotOver
                )
            }
        }
    }

    let draw = &ctx.accounts.draw;

    let length_to_generate = if draw.draw_info.prizes.len() as u32 * 10 < 100 {
        100
    } else {
        draw.draw_info.prizes.len() * 2
    };

    let highest_possible_ticket_id = if draw.draw_info.ticket_info.sold * 2 < 100 {
        100
    } else {
        draw.draw_info.ticket_info.sold * 2
    };

    let recent_slothashes = &ctx.accounts.recent_slothashes;
    let data = recent_slothashes.data.borrow();
    let most_recent = arrayref::array_ref![data, 12, 8];
    let clock = Clock::get()?;
    let seed: u64 = u64::from_le_bytes(*most_recent).saturating_sub(clock.unix_timestamp as u64);

    let winners = generate_vector(
        seed,
        length_to_generate as u32,
        highest_possible_ticket_id as u64,
    );

    ctx.accounts.verification_account.potential_winners = winners;

    Ok(())
}

struct XorShift64Star {
    state: u64,
}

impl XorShift64Star {
    fn new(seed: u64) -> Self {
        Self { state: seed }
    }

    fn next(&mut self) -> u64 {
        self.state ^= self.state >> 12; // a
        self.state ^= self.state << 25; // b
        self.state ^= self.state >> 27; // c
        self.state.wrapping_mul(2685821657736338717) // multiplication for the '*' in XOR-Shift*
    }
}

fn generate_vector(seed: u64, length: u32, max_number: u64) -> Vec<u32> {
    let mut vec = Vec::with_capacity(length as usize);
    let mut rng = XorShift64Star::new(seed);
    let mut unique_values = HashSet::new();

    while unique_values.len() < length as usize {
        let value = (rng.next() % max_number) as u32;
        unique_values.insert(value);
    }

    vec.extend(unique_values);
    vec
}

fn calculate_space(draw: &Draw) -> usize {
    if draw.draw_info.prizes.len() as u32 * 10 < 100 {
        100
    } else {
        (draw.draw_info.ticket_info.sold * 2) as usize
    }
}
