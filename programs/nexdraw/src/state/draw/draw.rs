use super::tickets::TicketInfo;
use super::types::DrawType;
use super::winners::Winners;
use super::{ DrawInfo, Timed };
use anchor_lang::prelude::*;

#[account]
#[derive(PartialEq, Eq, Debug)]
pub struct Draw {
    /// The pubkey of the draw manager.
    manager: Pubkey,
    /// The id of the draw.
    draw_id: u32,
    /// Info about the draw.
    draw_info: DrawInfo,
    /// The info about the tickets,
    ticket_info: TicketInfo,
    winners: Winners,
    /// Unused reservfe byte space for future changes
    _reserved: [u8; 64],
}

impl Draw {
    pub fn size(max_prizes_size: usize) -> usize {
        8 + // anchor namespace
            32 + // manager
            4 + // draw_id
            DrawInfo::size(max_prizes_size) + // draw_info
            TicketInfo::size() // ticket_info
    }
    pub fn new_timed(
        manager: Pubkey,
        draw_id: u32,
        timed: Timed,
        ticket_info: TicketInfo
    ) -> Result<Self> {
        Ok(Self {
            manager,
            draw_id,
            draw_info: DrawInfo::new(DrawType::Timed(timed)),
            ticket_info,
            winners: Winners::new(),
            _reserved: [0; 64],
        })
    }
}
