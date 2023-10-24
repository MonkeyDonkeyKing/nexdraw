use anchor_lang::prelude::*;

use crate::NexdrawErrors;

#[constant]
const PERCENTAGE_PRECISION: u16 = 10_000;  // Represents 100.00%

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct PercentageHandler {
    pub value: u16,
}

impl PercentageHandler {
    pub fn new(percentage: u16) -> Result<Self> {
        require!(percentage <= PERCENTAGE_PRECISION, NexdrawErrors::InvalidPercentage);
        Ok(Self {value: percentage})
    }

    pub fn calculate(&self, amount: u64) -> u64 {
        (amount * self.value as u64) / PERCENTAGE_PRECISION as u64
    }
}