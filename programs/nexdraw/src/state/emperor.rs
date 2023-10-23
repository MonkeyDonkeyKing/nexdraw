use anchor_lang::prelude::*;

#[account]
pub struct Emperor {
    pub authority: Pubkey,
}

impl Emperor {
    pub const SIZE: usize = 8 + 32;

    pub fn new(authority: Pubkey) -> Self {
        Self { authority }
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
