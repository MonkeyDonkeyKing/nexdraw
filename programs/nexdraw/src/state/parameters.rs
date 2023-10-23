use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateDrawRegentParams {
    pub increase_draws: u32,
    pub new_commission: u64,
}


