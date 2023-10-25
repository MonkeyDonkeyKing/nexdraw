use super::capped_draw::Capped;
use super::timed_draw::Timed;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum DrawStatus {
    Concepting,
    Live,
    Drawing,
    Claim,
    Finalized,
    Canceled,
}

impl DrawStatus {
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
pub enum DrawType {
    Capped(Capped),
    Timed(Timed),
}

impl DrawType {
    pub fn size() -> usize {
        Capped::SIZE.max(Timed::SIZE) + 1 // enum byte
    }
}