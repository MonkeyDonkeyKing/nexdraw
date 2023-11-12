use super::tickets::TicketInfo;
use super::types::DrawType;
use super::winners::Winners;
use super::{draw_info, DrawInfo, Timed};
use anchor_lang::prelude::*;

#[account]
#[derive(PartialEq, Eq, Debug)]
pub struct Draw {
    /// The pubkey of the draw manager.
    pub draw_regent: Pubkey,
    /// The id of the draw.
    pub draw_id: u32,
    /// Info about the draw.
    pub draw_info: DrawInfo,
    /// The info about the tickets,
    pub winners: Winners,
    /// Unused reservfe byte space for future changes
    _reserved: [u8; 64],
}

impl Draw {
    pub fn size(max_prizes_size: usize) -> usize {
        8 + // anchor namespace
        32 + // manager
        4 + // draw_id
        DrawInfo::size(max_prizes_size) + // draw_info
        Winners::size(max_prizes_size) + // winners
        64 // reserved
    }
    pub fn new_timed(
        draw_regent: Pubkey,
        draw_id: u32,
        timed: Timed,
        ticket_info: TicketInfo,
    ) -> Result<Self> {
        Ok(Self {
            draw_regent,
            draw_id,
            draw_info: DrawInfo::new(DrawType::Timed(timed), ticket_info),
            winners: Winners::new(),
            _reserved: [0; 64],
        })
    }
}
