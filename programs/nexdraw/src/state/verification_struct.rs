use anchor_lang::prelude::*;

#[account]
pub struct VerificationStruct {
    pub draw: Pubkey,
    pub potential_winners: Vec<u32>,
}

impl VerificationStruct {
    pub fn size(length: u32) -> usize {
        8 + 4 + (length as usize * 4)
    }
}
