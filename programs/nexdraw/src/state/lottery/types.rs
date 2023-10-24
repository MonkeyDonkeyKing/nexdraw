use super::capped_lottery::Capped;
use super::timed_lottery::Timed;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum LotteryStatus {
    Concepting,
    Live,
    Drawing,
    Claim,
    Finalized,
    Canceled,
}

impl LotteryStatus {
    pub const SIZE: usize = 1; // enum byte
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum DrawingStatus {
    Progressing { index: u32 },
    Incomplete { cleaned: bool },
    Done,
}

impl DrawingStatus {
    pub const SIZE: usize = 1 + 4; // enum byte + u32
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum CancelStatus {
    Refunding { tickets: u32 },
    Done,
}

impl CancelStatus {
    pub const SIZE: usize = 1 + 4; // enum byte + u32
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum LotteryType {
    Capped(Capped),
    Timed(Timed),
}

impl LotteryType {
    pub fn size() -> usize {
        Capped::SIZE.max(Timed::SIZE) + 1 // enum byte
    }
}