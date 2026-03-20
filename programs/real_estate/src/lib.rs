use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("RealEstate111111111111111111111111111111111");

#[program]
pub mod real_estate {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        title: String,
        property_id: u64,
        value_usd: u64,
        total_shares: u64,
    ) -> Result<()> {
        instructions::initialize::initialize_vault(
            ctx,
            title,
            property_id,
            value_usd,
            total_shares,
        )
    }

    pub fn fractionalize(ctx: Context<FractionalizeProperty>, property_id: u64) -> Result<()> {
        instructions::fractionalize(ctx, property_id)
    }
}
