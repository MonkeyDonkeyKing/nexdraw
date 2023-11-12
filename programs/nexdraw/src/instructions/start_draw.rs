use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{Metadata, CreateMetadataAccountsV3, CreateMasterEditionV3, self},
    token::{Mint, MintTo, Token, TokenAccount, FreezeAccount, self},
};

use crate::state::{Draw, DrawRegent, DrawStatus, DrawType};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct StartDrawParams {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

#[derive(Accounts)]
pub struct StartDraw<'info> {
    /*
       Lottery NFT details
    */
    #[account(
        init,
        payer = draw_manager,
        seeds = [
            "draw_mint".as_bytes(),
            draw.key().to_bytes().as_ref(),
        ],
        bump,
        mint::decimals = 0,
        mint::authority = draw,
        mint::freeze_authority = draw
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        mut,         
        seeds = [
            "metadata".as_bytes(),
            Metadata::id().as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        seeds::program = Metadata::id(),
    )]
    /// CHECK: We're about to create this with Metaplex
    pub metadata: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [
            "metadata".as_bytes(),
            Metadata::id().as_ref(),
            mint.key().as_ref(),
            "edition".as_bytes(),
        ],
        bump,
        seeds::program = Metadata::id(),
    )]
    /// CHECK: We're about to create this with Metaplex
    pub master_edition: UncheckedAccount<'info>,
    #[account(
        init,
        payer = draw_manager,
        associated_token::mint = mint,
        associated_token::authority = draw,
    )]
    pub token_account: Account<'info, TokenAccount>,
    /*
       Draw details
    */
    #[account(mut)]
    pub draw_manager: Signer<'info>,
    #[account(mut, has_one = draw_manager, seeds = ["draw_regent".as_bytes(), draw_manager.key().as_ref()], bump)]
    pub draw_regent: Account<'info, DrawRegent>,
    #[account(
        mut,
        has_one = draw_regent,
        seeds = [
            "draw".as_bytes(),
            draw.draw_regent.key().as_ref(),
            draw.draw_id.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub draw: Box<Account<'info, Draw>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> StartDraw<'info> {
    pub fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let program = self.token_program.to_account_info();
        let cpi_accounts = MintTo {
            mint: self.mint.to_account_info(),
            to: self.token_account.to_account_info(),
            authority: self.draw.to_account_info(),
        };
        CpiContext::new(program, cpi_accounts)
    }

    pub fn freeze_account(&self) -> CpiContext<'_, '_, '_, 'info, FreezeAccount<'info>> {
        let program = self.token_program.to_account_info();
        let cpi_accounts = FreezeAccount {
            account: self.token_account.to_account_info(),
            mint: self.mint.to_account_info(),
            authority: self.draw.to_account_info(),
        };
        CpiContext::new(program, cpi_accounts)
    }
    pub fn create_metadata_accounts_v3(&self) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
        let program = self.metadata_program.to_account_info();
        let cpi_accounts = CreateMetadataAccountsV3 {
            metadata: self.metadata.to_account_info(),
            mint: self.mint.to_account_info(),
            mint_authority: self.draw.to_account_info(),
            payer: self.draw_manager.to_account_info(),
            update_authority: self.draw.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(),
        };
        CpiContext::new(program, cpi_accounts)
    }
    pub fn create_master_edition_v3(&self) -> CpiContext<'_, '_, '_, 'info, CreateMasterEditionV3<'info>> {
        let program = self.metadata_program.to_account_info();
        let cpi_accounts = CreateMasterEditionV3 {
            edition: self.master_edition.to_account_info(),
            mint: self.mint.to_account_info(),
            update_authority: self.draw.to_account_info(),
            mint_authority: self.draw.to_account_info(),
            payer: self.draw_manager.to_account_info(),
            metadata: self.metadata.to_account_info(),
            rent: self.rent.to_account_info(),
            system_program: self.system_program.to_account_info(),
            token_program: self.token_program.to_account_info(),
        };
        CpiContext::new(program, cpi_accounts)
    }
}

pub fn start_draw_handler(ctx: Context<StartDraw>, params: StartDrawParams) -> Result<()> {
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
            require_gte!(timed.min_tickets_sold, total_prizes);
        }
    }

    draw.draw_info.status = DrawStatus::Live;

    let draw = &ctx.accounts.draw;

    token::mint_to(
        ctx.accounts.mint_to_ctx()
        .with_signer(&[&["draw".as_bytes(), draw.draw_regent.key().as_ref(), draw.draw_id.to_le_bytes().as_ref(), &[ctx.bumps.draw]]]),
        1
    )?;

    token::freeze_account(
        ctx.accounts.freeze_account()
        .with_signer(&[&["draw".as_bytes(), draw.draw_regent.key().as_ref(), draw.draw_id.to_le_bytes().as_ref(), &[ctx.bumps.draw]]])
    )?;

    metadata::create_metadata_accounts_v3(
        ctx.accounts.create_metadata_accounts_v3()
        .with_signer(&[&["draw".as_bytes(), draw.draw_regent.key().as_ref(), draw.draw_id.to_le_bytes().as_ref(), &[ctx.bumps.draw]]]),
        mpl_token_metadata::types::DataV2 {
            name: params.name,
            symbol: params.symbol,
            uri: params.uri,
            collection: None,
            uses: None,
            creators: None,
            seller_fee_basis_points: 0,
        },
        false,
        false,
        None,
    )?;

    metadata::create_master_edition_v3(
        ctx.accounts.create_master_edition_v3().with_signer(&[&["draw".as_bytes(), draw.draw_regent.key().as_ref(), draw.draw_id.to_le_bytes().as_ref(), &[ctx.bumps.draw]]]),
        Some(0),
    )?;

    Ok(())
}
