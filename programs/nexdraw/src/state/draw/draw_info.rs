use anchor_lang::prelude::*;

use super::{DrawStatus, DrawType, Prizes};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct DrawInfo {
    pub draw_type: DrawType,
    pub status: DrawStatus,
    pub prizes: Prizes,
}

impl DrawInfo {
    pub fn size(prizes: usize) -> usize {
        DrawType::size() + // draw_type
        DrawStatus::size() + // status
        Prizes::size(prizes) // prizes
    }

    pub fn new(draw_type: DrawType) -> Self {
        Self {
            draw_type,
            status: DrawStatus::Concepting,
            prizes: Prizes::new(),
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
}
