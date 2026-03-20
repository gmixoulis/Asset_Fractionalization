use anchor_lang::prelude::*;

#[account]
pub struct Property {
    pub authority: Pubkey,
    pub property_nft_mint: Pubkey, // The SPL Token Mint of the original NFT
    pub vault_token_account: Pubkey, // The Vault's ATA that holds the NFT
    pub fractional_mint: Pubkey, // The new SPL token mint representing fractional shares
    pub title: String,
    pub value_usd: u64,
    pub total_shares: u64,
    pub is_fractionalized: bool,
    pub bump: u8,
}

impl Property {
    pub const INIT_SPACE: usize = 8 + // discriminator
        32 + // authority
        32 + // property_nft_mint
        32 + // vault_token_account
        32 + // fractional_mint
        4 + 50 + // title (String: 4 prefix + up to 50 chars)
        8 + // value_usd
        8 + // total_shares
        1 + // is_fractionalized
        1; // bump
}
