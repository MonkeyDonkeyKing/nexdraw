
use anchor_lang::prelude::*;

use crate::NexdrawErrors;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct Timed {
    pub end_time: i64,
    /// this variable will always default to the length of the prizes array at launch
    pub min_tickets_sold: u32,
    pub tickets_for_sale: Option<u32>,
    reserved: [u8; 112],
    reserved2: [u8; 7],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct TimedParams {
    pub end_time: i64,
    pub min_tickets_sold: u32,
    pub tickets_for_sale: Option<u32>,
}
#[constant]
pub const ONE_YEAR_IN_SECONDS: i64 = 31_536_000;

impl Timed {
    pub const SIZE: usize = 8 + 4 + (1 + 4) + 112 + 7;

    pub fn new(params: TimedParams) -> Result<Self> {
        let TimedParams {
            end_time,
            min_tickets_sold,
            tickets_for_sale,
        } = params;

        let new_timed = Self {
            end_time,
            min_tickets_sold,
            tickets_for_sale,
            reserved: [0; 112],
            reserved2: [0; 7],
        };

        new_timed.validate()?;

        Ok(new_timed)
    }

    fn validate(&self) -> Result<()> {
        let time = Clock::get()?.unix_timestamp;

        require!(self.end_time > time, NexdrawErrors::ElapsedEndTime);
        require!(
            self.end_time - time <= ONE_YEAR_IN_SECONDS,
            NexdrawErrors::EndTimeExceedsOneYear
        );

        require!(self.min_tickets_sold > 0, NexdrawErrors::MinTicketsIsZero);

        if let Some(tickets_for_sale) = self.tickets_for_sale {
            // if tickets for sale is set, it must be greater than or equal to the min tickets sold
            require!(
                tickets_for_sale >= self.min_tickets_sold,
                NexdrawErrors::MinMaxTicketsCrossOver
            );
        }

        Ok(())
    }
}