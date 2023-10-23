use anchor_lang::prelude::*;


#[account]
pub struct DrawRegent {
    pub draw_manager: Pubkey,
    next_draw_id: u32,
    draws_remaining: u32,
    emperor_commission: u64,
}

impl DrawRegent {
    pub const SIZE: usize = 8 + 32 + 4 + 4 + 8;

    pub fn new(draw_manager: Pubkey, draws_remaining: u32, emperor_commission: u64) -> Self {
        Self {
            draw_manager,
            next_draw_id: 0,
            draws_remaining,
            emperor_commission,
        }
    }
}