use anchor_lang::prelude::*;

use crate::NexdrawErrors;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct Timed {
    end_time: i64,
    min_tickets_sold: u32,
    tickets_for_sale: Option<u32>,
    reserved: [u8; 112],
    reserved2: [u8; 7],
}

pub struct TimedParams {
    pub end_time: i64,
    pub min_tickets_sold: u32,
    pub tickets_for_sale: Option<u32>,
    pub current_time: i64,
}

impl Timed {
    pub const SIZE: usize = 8 + 4 + (1 + 4) + 112 + 7;

    pub fn new(params: TimedParams) -> Result<Self> {
        let TimedParams {
            end_time,
            min_tickets_sold,
            tickets_for_sale,
            current_time,
        } = params;

        let new_timed = Self {
            end_time,
            min_tickets_sold,
            tickets_for_sale,
            reserved: [0; 112],
            reserved2: [0; 7],
        };

        new_timed.validate(current_time)?;

        Ok(new_timed)
    }

    fn validate(&self, current_time: i64) -> Result<()> {
        require!(self.end_time > current_time, NexdrawErrors::ElapsedEndTime);

        require!(self.min_tickets_sold > 0, NexdrawErrors::MinTicketsIsZero);

        if let Some(tickets_for_sale) = self.tickets_for_sale {
            require!(
                tickets_for_sale >= self.min_tickets_sold,
                NexdrawErrors::MinMaxTicketsCrossOver
            );
        }

        Ok(())
    }
}