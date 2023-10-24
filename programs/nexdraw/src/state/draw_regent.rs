use anchor_lang::prelude::*;
use crate::{utils::PercentageHandler};


#[account]
pub struct DrawRegent {
    pub draw_manager: Pubkey,
    next_draw_id: u32,
    draws_remaining: u32,
    /// decimal percentage representation of the commission
    emperor_percent_commission: u16,
    _reserved: [u8; 70],
}

impl DrawRegent {
    pub const SIZE: usize = 
    8 // 8 bytes anchor account discriminator
    + 32 // 32 bytes draw manager pubkey
    + 4 // 4 bytes next draw id
    + 4 // 4 bytes draws remaining
    + 2 // 2 bytes emperor percent commission
    + 70; // 70 bytes reserved

    pub fn try_new(draw_manager: Pubkey, draws_remaining: u32, emperor_percent_commission: u16) -> Result<Self> {
        Ok(Self {
            draw_manager,
            next_draw_id: 0,
            draws_remaining,
            emperor_percent_commission: PercentageHandler::new(emperor_percent_commission).unwrap().value,
            _reserved: [0; 70],
        })
    }

    pub fn get_draw_id(&self) -> u32 {
        self.next_draw_id
    }

    pub fn increase_draw_id(&mut self) {
        self.next_draw_id += 1;
    }

    pub fn try_update(&mut self, draws_remaining: Option<u32>, emperor_percent_commission: Option<u16>) -> Result<()> {
        if let Some(draws_remaining) = draws_remaining {
            self.draws_remaining = draws_remaining;
        }
        if let Some(emperor_percent_commission) = emperor_percent_commission {
            self.emperor_percent_commission = PercentageHandler::new(emperor_percent_commission)?.value;
        }
        Ok(())
    }
}