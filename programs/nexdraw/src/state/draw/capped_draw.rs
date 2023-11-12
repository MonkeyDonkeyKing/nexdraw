use anchor_lang::prelude::*;

use crate::NexdrawErrors;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct Capped {
    pub maximum_duration: i64,
    pub ticket_cap: u32,
    reserved: [u8; 124],
}

impl Capped {
    pub const SIZE: usize = 8 + 4 + 124;

    pub fn new(maximum_duration: i64, ticket_cap: u32) -> Result<Self> {
        let new_capped = Self {
            maximum_duration,
            ticket_cap,
            reserved: [0; 124],
        };

        new_capped.validate()?;

        Ok(new_capped)
    }

    fn validate(&self) -> Result<()> {
        require!(self.maximum_duration > 0, NexdrawErrors::DurationisZero);

        Ok(())
    }
}
