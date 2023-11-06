use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{MasterEditionAccount, Metadata, MetadataAccount},
    token::{self, Mint, Token, TokenAccount, Transfer},
};

use crate::state::{Draw, DrawRegent, DrawStatus, Prize};

#[derive(Accounts)]
#[instruction(prize: Pubkey)]
pub struct AddNftPrize<'info> {
    /*
       Token details
    */
    #[account(mint::decimals = 0, mint::authority = master_edition)]
    pub mint: Box<Account<'info, Mint>>,
    #[account(
        seeds = [
            b"metadata".as_ref(),
            Metadata::id().as_ref(),
            mint.key().as_ref()
        ],
        seeds::program = Metadata::id(),
        bump,
    )]
    pub metadata: Box<Account<'info, MetadataAccount>>,
    #[account(
        seeds = [
            b"metadata".as_ref(),
            Metadata::id().as_ref(),
            mint.key().as_ref(),
            b"edition".as_ref(),
        ],
        seeds::program = Metadata::id(),
        bump,
    )]
    pub master_edition: Box<Account<'info, MasterEditionAccount>>,
    #[account(
        init,
        payer = draw_manager,
        associated_token::mint = mint,
        associated_token::authority = draw_regent
    )]
    pub receiver_ata: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = draw_manager,
    )]
    pub sender_ata: Box<Account<'info, TokenAccount>>,

    /*
       Draw details
    */
    // is the signer
    #[account(mut)]
    pub draw_manager: Signer<'info>,
    #[account(mut, has_one = draw_manager)]
    // is the draw manager account of which the signer is the authority
    pub draw_regent: Account<'info, DrawRegent>,
    #[account(
        mut,
        has_one = draw_regent,
        realloc = Draw::size(draw.draw_info.prizes.len() + 1),
        realloc::payer = draw_manager,
        realloc::zero = false,
    )]
    // is the draw account of which the draw regent is the authority
    pub draw: Account<'info, Draw>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
}

impl<'info> AddNftPrize<'info> {
    pub fn transfer_token_accounts_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let program = self.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.sender_ata.to_account_info(),
            to: self.receiver_ata.to_account_info(),
            authority: self.draw_manager.to_account_info(),
        };
        CpiContext::new(program, cpi_accounts)
    }
}

pub fn add_nft_prize_handler(ctx: Context<AddNftPrize>, prize: Pubkey) -> Result<()> {
    let draw = &mut ctx.accounts.draw;
    matches!(draw.draw_info.status, DrawStatus::Concepting);
    draw.draw_info.prizes.add_prize(&Prize::Nft { mint: prize });

    token::transfer(ctx.accounts.transfer_token_accounts_ctx(), 1)?;

    Ok(())
}
