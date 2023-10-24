use anchor_lang::prelude::*;

use crate::state::{ lottery::timed_lottery::TimedParams, Timed };

use super::{ CancelStatus, DrawingStatus, LotteryStatus, LotteryType, Prizes };

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct LotteryInfo {
    lottery_type: LotteryType,
    status: LotteryStatus,
    drawing_status: Option<DrawingStatus>,
    cancel_status: Option<CancelStatus>,
    prizes: Prizes,
}

impl LotteryInfo {
    pub fn size(max_prizes_size: usize) -> usize {
        LotteryType::size() + // lottery_type
            LotteryStatus::SIZE + // status
            DrawingStatus::SIZE + // drawing_status
            CancelStatus::SIZE + // cancel_status
            Prizes::size(max_prizes_size) // prizes
    }

    pub fn new(lottery_type: LotteryType) -> Self {
        Self {
            lottery_type,
            status: LotteryStatus::Concepting,
            drawing_status: None,
            cancel_status: None,
            prizes: Prizes::new(),
        }
    }

    pub fn update_lottery_type(&mut self, lottery_type: LotteryType) {
        matches!(self.status, LotteryStatus::Concepting);
        let updated_lottery_type = match lottery_type {
            LotteryType::Capped(_) => {
                panic!("Capped lotteries not supported yet");
            }
            LotteryType::Timed(x) => LotteryType::Timed(x),
        };
        self.lottery_type = updated_lottery_type;
    }
}