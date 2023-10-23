use anchor_lang::prelude::*;

#[account]
pub struct Emperor {
    pub authority: Pubkey,
    _reserved: [u8; 320],
}

impl Emperor {
    pub const SIZE: usize = 
    8 // 8 bytes anchor account discriminator 
    + 32 // 32 bytes authority pubkey
    + 32 * 10; // 320 bytes reserved

    pub fn new(authority: Pubkey) -> Self {
        Self { authority, _reserved: [0; 320] }
    }

    pub fn has_authority(&self, pubkey: Pubkey) -> bool {
        self.authority == pubkey
    }

    pub fn update_authority(&mut self, new_authority: Pubkey) -> Result<()> {
        require_keys_neq!(self.authority, new_authority, crate::CustomError::InvalidAuthority);
        self.authority = new_authority;
        Ok(())
    }
}
