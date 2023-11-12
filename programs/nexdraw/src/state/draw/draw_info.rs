use anchor_lang::prelude::*;

use super::{DrawStatus, DrawType, Prizes, TicketInfo};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct DrawInfo {
    pub draw_type: DrawType,
    pub status: DrawStatus,
    pub prizes: Prizes,
    pub ticket_info: TicketInfo,
}

impl DrawInfo {
    pub fn size(prizes: usize) -> usize {
        DrawType::size() + // draw_type
        DrawStatus::size() + // status
        Prizes::size(prizes) + // prizes
        TicketInfo::size() // ticket_info
    }

    pub fn new(draw_type: DrawType, ticket_info: TicketInfo) -> Self {
        Self {
            draw_type,
            status: DrawStatus::Concepting,
            prizes: Prizes::new(),
            ticket_info,
        }
    }

    pub fn update_draw_type(&mut self, draw_type: DrawType) {
        matches!(self.status, DrawStatus::Concepting);
        let updated_draw_type = match draw_type {
            DrawType::Capped(_) => {
                panic!("Capped lotteries not supported yet");
            }
            DrawType::Timed(x) => DrawType::Timed(x),
        };
        self.draw_type = updated_draw_type;
    }

    pub fn get_end_time(&self) -> Result<i64> {
        match &self.draw_type {
            DrawType::Capped(_) => {
                panic!("Capped lotteries not supported yet");
            }
            DrawType::Timed(timed) => Ok(timed.end_time),
        }
    }

    pub fn get_max_tickets_for_sale(&self) -> Option<u32> {
        match &self.draw_type {
            DrawType::Capped(capped) => Some(capped.ticket_cap),
            DrawType::Timed(timed) => {
                if let Some(max_tickets) = timed.tickets_for_sale {
                    Some(max_tickets)
                } else {
                    None
                }
            }
        }
    }
}
