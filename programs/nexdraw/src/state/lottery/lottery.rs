use super::tickets::TicketInfo;
use super::types::LotteryType;
use super::winners::Winners;
use super::{ LotteryInfo, Timed };
use anchor_lang::prelude::*;

#[account]
#[derive(PartialEq, Eq, Debug)]
pub struct Lottery {
    /// The pubkey of the lottery manager.
    manager: Pubkey,
    /// The id of the lottery.
    lottery_id: u32,
    /// Info about the lottery.
    lottery_info: LotteryInfo,
    /// The info about the tickets,
    ticket_info: TicketInfo,
    winners: Winners,
    /// Unused reservfe byte space for future changes
    _reserved: [u8; 64],
}

impl Lottery {
    pub fn size(max_prizes_size: usize) -> usize {
        8 + // anchor namespace
            32 + // manager
            4 + // lottery_id
            LotteryInfo::size(max_prizes_size) + // lottery_info
            TicketInfo::size() // ticket_info
    }
    pub fn new_timed(
        manager: Pubkey,
        lottery_id: u32,
        timed: Timed,
        ticket_info: TicketInfo
    ) -> Result<Self> {
        Ok(Self {
            manager,
            lottery_id,
            lottery_info: LotteryInfo::new(LotteryType::Timed(timed)),
            ticket_info,
            winners: Winners::new(),
            _reserved: [0; 64],
        })
    }
}
