#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
#[cfg(not(feature = "no-entrypoint"))]
use solana_security_txt::security_txt;

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    name: "nexdraw",
    project_url: "https://solpix.io/",
    contacts: "solpixnft@gmail.com,twitter:@solpixdao",
    preferred_languages: "en"
}

mod instructions;
mod state;
mod utils;

use instructions::*;
use state::*;

#[program]
pub mod nexdraw {
    use super::*;
    /// Creates the global owner of the program
    /// Only the emperor can create draw managers
    pub fn initialize_emperor(ctx: Context<InitializeEmperor>) -> Result<()> {
        initialize_emperor_handler(ctx)
    }

    /// Updates the authority of the emperor account
    /// Only the current emperor can update the authority
    pub fn update_emperor(ctx: Context<UpdateEmperor>, new_authority: Pubkey) -> Result<()> {
        update_emperor_handler(ctx, new_authority)
    }

    /// Creates a new draw regent account
    /// Only the emperor can create draw regents
    pub fn create_draw_regent(
        ctx: Context<CreateDrawRegent>,
        regent_key: Pubkey,
        draws_left: u32,
        commission: u16,
    ) -> Result<()> {
        create_draw_regent_handler(ctx, regent_key, draws_left, commission)
    }

    /// Updates the draw regent account
    /// Only the emperor can update draw regents
    pub fn update_draw_regent(
        ctx: Context<UpdateDrawRegent>,
        draws_remaining: Option<u32>,
        new_emperor_commission: Option<u16>,
    ) -> Result<()> {
        update_draw_regent_handler(ctx, draws_remaining, new_emperor_commission)
    }
    /// Creates a new timed solana ticketprice draw
    /// Only the draw regent can create lotteries
    pub fn create_timed_sol_draw(
        ctx: Context<CreateTimedSolDraw>,
        ticket_price: u64,
        timed_params: TimedParams,
    ) -> Result<()> {
        create_timed_sol_draw_handler(ctx, ticket_price, timed_params)
    }

    /// adds an nft prize to the draw
    /// Only the draw regent can add nft prizes
    pub fn add_nft_prize(ctx: Context<AddNftPrize>, nft_prize: Pubkey) -> Result<()> {
        add_nft_prize_handler(ctx, nft_prize)
    }
}

declare_id!("DRAWDnBHxRrointnFhaLEsexAXjgW2rUqZU7qpGqxonP");

#[error_code]
pub enum NexdrawErrors {
    #[msg("invalid authority provided")]
    InvalidAuthority,
    #[msg("invalid percentage provided")]
    InvalidPercentage,

    ElapsedEndTime,
    EndTimeExceedsOneYear,
    DurationisZero,
    MinTicketsIsZero,
    MinMaxTicketsCrossOver,
    NoNftDuplicates,
}
