use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use crate::state::*;

#[derive(Accounts)]
#[instruction(title: String, _property_id: u64)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = Property::INIT_SPACE,
        seeds = [b"property", authority.key().as_ref(), &_property_id.to_le_bytes()],
        bump
    )]
    pub property: Account<'info, Property>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// The original Real Estate NFT mint
    pub property_nft_mint: Account<'info, Mint>,

    /// The Vault's token account to hold the NFT.
    #[account(
        init,
        payer = authority,
        token::mint = property_nft_mint,
        token::authority = property,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// The SPL Token mint for the fractional shares
    #[account(
        init,
        payer = authority,
        mint::decimals = 0, // Shares are whole numbers (1 share = 1 token usually, or decimals=6 if needed)
        mint::authority = property,
    )]
    pub fractional_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn initialize_vault(
    ctx: Context<InitializeVault>,
    title: String,
    _property_id: u64,
    value_usd: u64,
    total_shares: u64,
) -> Result<()> {
    let property = &mut ctx.accounts.property;

    property.authority = ctx.accounts.authority.key();
    property.property_nft_mint = ctx.accounts.property_nft_mint.key();
    property.vault_token_account = ctx.accounts.vault_token_account.key();
    property.fractional_mint = ctx.accounts.fractional_mint.key();
    
    property.title = title;
    property.value_usd = value_usd;
    property.total_shares = total_shares;
    property.is_fractionalized = false;
    property.bump = ctx.bumps.property;

    Ok(())
}
