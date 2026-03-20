use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, MintTo, Transfer},
};
use crate::state::*;

#[derive(Accounts)]
#[instruction(property_id: u64)]
pub struct FractionalizeProperty<'info> {
    #[account(
        mut,
        seeds = [b"property", authority.key().as_ref(), &property_id.to_le_bytes()],
        bump = property.bump,
        has_one = authority,
        has_one = property_nft_mint @ ErrorCode::InvalidMint,
        has_one = vault_token_account @ ErrorCode::InvalidVaultAccount,
        has_one = fractional_mint @ ErrorCode::InvalidFractionalMint,
        constraint = !property.is_fractionalized @ ErrorCode::AlreadyFractionalized
    )]
    pub property: Account<'info, Property>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub property_nft_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority_nft_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub fractional_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = fractional_mint,
        associated_token::authority = authority,
    )]
    pub authority_fractional_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn fractionalize(ctx: Context<FractionalizeProperty>, property_id: u64) -> Result<()> {
    // 1. Transfer the Real Estate NFT from the authority to the Vault
    let transfer_cpi_accounts = Transfer {
        from: ctx.accounts.authority_nft_account.to_account_info(),
        to: ctx.accounts.vault_token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    let transfer_cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_cpi_accounts,
    );
    token::transfer(transfer_cpi_ctx, 1)?;

    // 2. Mint the fractional SPL tokens to the authority
    let property = &mut ctx.accounts.property;
    let amount = property.total_shares;
    let authority_key = property.authority;
    let bump = property.bump;
    let prop_id_bytes = property_id.to_le_bytes();

    let signer_seeds: &[&[&[u8]]] = &[&[
        b"property",
        authority_key.as_ref(),
        &prop_id_bytes,
        &[bump],
    ]];

    let mint_cpi_accounts = MintTo {
        mint: ctx.accounts.fractional_mint.to_account_info(),
        to: ctx.accounts.authority_fractional_account.to_account_info(),
        authority: property.to_account_info(),
    };
    let mint_cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        mint_cpi_accounts,
        signer_seeds,
    );
    token::mint_to(mint_cpi_ctx, amount)?;

    property.is_fractionalized = true;

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("This property has already been fractionalized.")]
    AlreadyFractionalized,
    #[msg("Invalid Property NFT Mint")]
    InvalidMint,
    #[msg("Invalid Vault Token Account")]
    InvalidVaultAccount,
    #[msg("Invalid Fractional Mint")]
    InvalidFractionalMint,
}
