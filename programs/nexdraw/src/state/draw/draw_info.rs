use anchor_lang::prelude::*;

use super::{CancelStatus, DrawStatus, DrawType, DrawingStatus, Prizes};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct DrawInfo {
    pub draw_type: DrawType,
    pub status: DrawStatus,
    pub drawing_status: Option<DrawingStatus>,
    pub cancel_status: Option<CancelStatus>,
    pub prizes: Prizes,
}

impl DrawInfo {
    pub fn size(max_prizes_size: usize) -> usize {
        DrawType::size() + // draw_type
        DrawStatus::SIZE + // status
        DrawingStatus::SIZE + // drawing_status
        CancelStatus::SIZE + // cancel_status
        Prizes::size(max_prizes_size) // prizes
    }

    pub fn new(draw_type: DrawType) -> Self {
        Self {
            draw_type,
            status: DrawStatus::Concepting,
            drawing_status: None,
            cancel_status: None,
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
