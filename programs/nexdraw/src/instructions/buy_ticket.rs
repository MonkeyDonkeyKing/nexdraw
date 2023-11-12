use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        self, CreateMasterEditionV3, CreateMetadataAccountsV3, MasterEditionAccount, Metadata,
        MetadataAccount, VerifyCollection,
    },
    token::{self, FreezeAccount, Mint, MintTo, Token, TokenAccount},
};
use mpl_token_metadata::types::Collection;

use crate::{
    program,
    state::{Draw, DrawStatus, DrawType},
    NexdrawErrors,
};

#[derive(Accounts)]
#[instruction(ticket_id: u32)]
pub struct BuyTicket<'info> {
    /*
       Lottery collection details
    */
    #[account(
        mut,
        seeds = [
            "metadata".as_bytes(),
            Metadata::id().as_ref(),
            draw_mint.key().as_ref(),
            "edition".as_bytes(),
        ],
        seeds::program = Metadata::id(),
        bump,
    )]
    pub draw_master_edition: Account<'info, MasterEditionAccount>,
    #[account(
        seeds = [
            "metadata".as_bytes(),
            Metadata::id().as_ref(),
            draw_mint.key().as_ref()
        ],
        seeds::program = Metadata::id(),
        bump,
    )]
    pub draw_metadata: Account<'info, MetadataAccount>,
    #[account(
        seeds = [
            "draw_mint".as_bytes(),
            draw.key().to_bytes().as_ref(),
        ],
        bump,
        mint::decimals = 0,
        mint::authority = draw_master_edition,
        mint::freeze_authority = draw_master_edition
    )]
    pub draw_mint: Account<'info, Mint>,
    /*
       Ticket
    */
    #[account(
        seeds = [
            "ticket".as_bytes(),
            draw.key().as_ref(),
            ticket_id.to_le_bytes().as_ref(),
        ],
        bump,
        init,
        payer = buyer,
        mint::decimals = 0,
        mint::authority = draw,
        mint::freeze_authority = draw
    )]
    pub ticket_mint: Account<'info, Mint>,
    #[account(
        mut,
        seeds = [
            "metadata".as_bytes(),
            Metadata::id().as_ref(),
            ticket_mint.key().as_ref()
        ],
        seeds::program = Metadata::id(),
        bump,
    )]
    /// CHECK: the metadata program takes care of this
    pub ticket_metadata: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [
            "metadata".as_bytes(),
            Metadata::id().as_ref(),
            ticket_mint.key().as_ref(),
            "edition".as_bytes(),
        ],
        seeds::program = Metadata::id(),
        bump,
    )]
    /// CHECK: the metadata program takes care of this
    pub ticket_master_edition: UncheckedAccount<'info>,
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

    /*
        Buyer
    */
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        init,
        payer = buyer,
        associated_token::mint = ticket_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    pub metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> BuyTicket<'info> {
    pub fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let program = self.token_program.to_account_info();
        let cpi_accounts = MintTo {
            mint: self.ticket_mint.to_account_info(),
            to: self.buyer_token_account.to_account_info(),
            authority: self.draw.to_account_info(),
        };
        CpiContext::new(program, cpi_accounts)
    }

    pub fn freeze_account(&self) -> CpiContext<'_, '_, '_, 'info, FreezeAccount<'info>> {
        let program = self.token_program.to_account_info();
        let cpi_accounts = FreezeAccount {
            account: self.buyer_token_account.to_account_info(),
            mint: self.ticket_mint.to_account_info(),
            authority: self.draw.to_account_info(),
        };
        CpiContext::new(program, cpi_accounts)
    }
    pub fn create_metadata_accounts_v3(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
        let program = self.metadata_program.to_account_info();
        let cpi_accounts = CreateMetadataAccountsV3 {
            metadata: self.ticket_metadata.to_account_info(),
            mint: self.ticket_mint.to_account_info(),
            mint_authority: self.draw.to_account_info(),
            payer: self.buyer.to_account_info(),
            update_authority: self.draw.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(),
        };
        CpiContext::new(program, cpi_accounts)
    }
    pub fn create_master_edition_v3(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, CreateMasterEditionV3<'info>> {
        let program = self.metadata_program.to_account_info();
        let cpi_accounts = CreateMasterEditionV3 {
            edition: self.ticket_master_edition.to_account_info(),
            mint: self.ticket_mint.to_account_info(),
            update_authority: self.draw.to_account_info(),
            mint_authority: self.draw.to_account_info(),
            payer: self.buyer.to_account_info(),
            metadata: self.ticket_metadata.to_account_info(),
            rent: self.rent.to_account_info(),
            system_program: self.system_program.to_account_info(),
            token_program: self.token_program.to_account_info(),
        };
        CpiContext::new(program, cpi_accounts)
    }

    pub fn verify_collection(&self) -> CpiContext<'_, '_, '_, 'info, VerifyCollection<'info>> {
        let program = self.metadata_program.to_account_info();
        let cpi_accounts = VerifyCollection {
            collection_authority: self.draw.to_account_info(),
            collection_master_edition: self.draw_master_edition.to_account_info(),
            collection_metadata: self.draw_metadata.to_account_info(),
            collection_mint: self.draw_mint.to_account_info(),
            metadata: self.ticket_metadata.to_account_info(),
            payer: self.buyer.to_account_info(),
        };
        CpiContext::new(program, cpi_accounts)
    }
}

pub fn buy_ticket_handler(ctx: Context<BuyTicket>, ticket_id: u32) -> Result<()> {
    {
        // this block checks if the selected ticket is not out of bounds for the current amount of tickets sold
        let tickets_sold = &ctx.accounts.draw.draw_info.ticket_info.sold;
        let max_ticket_id = if tickets_sold * 2 < 100 {
            100
        } else {
            tickets_sold * 2
        };
        require_gte!(max_ticket_id, ticket_id, NexdrawErrors::ExceedMaxTicketId);
    }

    {
        // this block checks if the draw is still within the time limit
        let time = Clock::get()?.unix_timestamp;
        let draw_end_time = ctx.accounts.draw.draw_info.get_end_time()?;
        require!(time < draw_end_time, NexdrawErrors::DrawEnded);
    }

    {
        // this block checks if the ticket we are buying does not exceed the max amount of tickets for sale
        if let Some(ticket_cap) = ctx.accounts.draw.draw_info.get_max_tickets_for_sale() {
            require_gt!(
                ticket_cap,
                ctx.accounts.draw.draw_info.ticket_info.sold,
                NexdrawErrors::MaxCapReached
            )
        }
    }

    ctx.accounts.draw.draw_info.ticket_info.sold += 1;

    let draw = &ctx.accounts.draw;
    token::mint_to(
        ctx.accounts.mint_to_ctx().with_signer(&[&[
            "draw".as_bytes(),
            draw.draw_regent.key().as_ref(),
            draw.draw_id.to_le_bytes().as_ref(),
            &[ctx.bumps.draw],
        ]]),
        1,
    )?;

    token::freeze_account(ctx.accounts.freeze_account().with_signer(&[&[
        "draw".as_bytes(),
        draw.draw_regent.key().as_ref(),
        draw.draw_id.to_le_bytes().as_ref(),
        &[ctx.bumps.draw],
    ]]))?;

    let metadata = &ctx.accounts.draw_metadata;
    // let name = format!("{} #{}", metadata.name, ticket_id);
    let name = format!("aaa #{}", ticket_id);

    let symbol = &metadata.symbol;
    let uri = &metadata.uri;

    metadata::create_metadata_accounts_v3(
        ctx.accounts.create_metadata_accounts_v3().with_signer(&[&[
            "draw".as_bytes(),
            draw.draw_regent.key().as_ref(),
            draw.draw_id.to_le_bytes().as_ref(),
            &[ctx.bumps.draw],
        ]]),
        mpl_token_metadata::types::DataV2 {
            name,
            symbol: symbol.clone(),
            uri: uri.clone(),
            collection: Some(Collection {
                verified: false,
                key: ctx.accounts.draw_mint.key(),
            }),
            uses: None,
            creators: None,
            seller_fee_basis_points: 0,
        },
        true,
        true,
        None,
    )?;

    metadata::create_master_edition_v3(
        ctx.accounts.create_master_edition_v3().with_signer(&[&[
            "draw".as_bytes(),
            draw.draw_regent.key().as_ref(),
            draw.draw_id.to_le_bytes().as_ref(),
            &[ctx.bumps.draw],
        ]]),
        Some(1),
    )?;
    metadata::verify_collection(
        ctx.accounts.verify_collection().with_signer(&[&[
            "draw".as_bytes(),
            draw.draw_regent.key().as_ref(),
            draw.draw_id.to_le_bytes().as_ref(),
            &[ctx.bumps.draw],
        ]]),
        None,
    )?;

    Ok(())
}
