use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum TicketPrice {
    Sol { value: u64 },
    Spl { mint: Pubkey, value: u64 },
}

impl TicketPrice {
    const SOL_SIZE: usize = 1 + 8;
    const SPL_SIZE: usize = 1 + 32 + 8;

    pub fn size() -> usize {
        Self::SOL_SIZE.max(Self::SPL_SIZE)
    }

    pub fn sol(value: u64) -> Self {
        Self::Sol { value }
    }

    /*
       This is commented out because it's not yet supported in our program
       pub fn spl(mint: Pubkey, value: u64) -> Self {
           Self::Spl { mint, value }
       }
    */
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct TicketInfo {
    pub price: TicketPrice,
    pub sold: u32,
}

impl TicketInfo {
    pub fn size() -> usize {
        TicketPrice::size() + 4
    }

    pub fn new(price: TicketPrice) -> Self {
        Self { price, sold: 0 }
    }
}
