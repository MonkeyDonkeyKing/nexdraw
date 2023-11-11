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

    // /// Updates an existing timed solana ticketprice draw
    // /// Only the draw regent can update lotteries and this is only possible if the draw has not started
    // pub fn update_timed_sol_draw() -> Result<()> {
    //     // will do this post MVP
    //     todo!()
    // }

    /// adds an nft prize to the draw
    /// Only the draw regent can add nft prizes
    pub fn add_nft_prize(ctx: Context<AddNftPrize>) -> Result<()> {
        add_nft_prize_handler(ctx)
    }

    /// adds pool prize to the draw this is either a sol or an spl token prize depending on the ticket price type
    /// Only the draw regent can add pool prizes
    pub fn add_pool_prize(ctx: Context<AddPoolPrize>, percentage: u16) -> Result<()> {
        add_pool_prize_handler(ctx, percentage)
    }

    // /// adds a fixed token prize to the draw
    // /// only the draw regent can add fixed token prizes
    // pub fn add_fixed_token_prize() -> Result<()> {
    //     // will do this post MVP
    //     todo!()
    // }

    // pub fn remove_nft_prize(ctx: Context<RemoveNftPrize>, index: usize) -> Result<()> {}
    // pub fn remove_pool_prize(ctx: Context<RemovePoolPrize>, index: usize) -> Result<()> {}
    // pub fn remove_fixed_token_prize(ctx: Context<RemoveFixedTokenPrize>, index: usize) -> Result<()> {}
    // pub fn delete_draw(ctx: Context<DeleteDraw>) -> Result<()> {}

    /// starts the draw
    /// Only the draw regent can start the draw
    pub fn start_draw(ctx: Context<StartDraw>, nft_params: StartDrawParams) -> Result<()> {
        start_draw_handler(ctx, nft_params)
    }

    /// buys a ticket for the draw
    /// Anyone can buy a ticket
    pub fn buy_ticket(ctx: Context<BuyTicket>, ticket_id: u32) -> Result<()> {
        buy_ticket_handler(ctx, ticket_id)
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
    ExceedMaxTicketId,
}
