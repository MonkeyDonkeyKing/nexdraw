use std::cmp;

use anchor_lang::prelude::*;

use crate::NexdrawErrors;

/// Size of the prize enum is interpreted as the size of the largest variant
/// (in this case, FixedAsset)
/// 1 + 16 + 32
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum Prize {
    Percentage {
        value: u16,
    },
    Nft {
        mint: Pubkey,
    },
    FixedAsset {
        mint: Pubkey,
        value: u64,
    },
}

impl Prize {
    const PERCENTAGE_SIZE: usize = 1 + 2;
    const NFT_SIZE: usize = 1 + 32;
    const FIXED_ASSET_SIZE: usize = 1 + 32 + 8;

    pub fn size() -> usize {
        // compare all sizes and return the largest one
        cmp::max(Self::PERCENTAGE_SIZE, cmp::max(Self::NFT_SIZE, Self::FIXED_ASSET_SIZE))
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct Prizes(Vec<Prize>);

// Define a constant for the maximum allowable percentage
#[constant]
const MAX_PERCENTAGE: u16 = 1000; // Let's assume it's 100 for this example, adjust as needed

impl Prizes {
    pub fn size(max_size: usize) -> usize {
        // 1 + 32 + 8
        Prize::size() * max_size
    }

    pub fn new() -> Self {
        Self(vec![])
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn add_prize(&mut self, prize: &Prize) {
        match prize {
            Prize::Percentage { value } => {
                self.add_percentage(*value).unwrap();
            }
            Prize::Nft { mint } => {
                self.add_nft(*mint).unwrap();
            }
            Prize::FixedAsset { mint, value } => {
                self.add_fixed_asset(*mint, *value);
            }
        }
    }

    fn add_percentage(&mut self, value: u16) -> Result<()> {
        let current_percentage = self.total_percentage();
        if current_percentage + value > MAX_PERCENTAGE {
            return Err(ProgramError::InvalidInstructionData.into()); // Adjust error as per your needs
        }
        self.0.push(Prize::Percentage { value });
        Ok(())
    }

    fn add_nft(&mut self, mint: Pubkey) -> Result<()> {
        if self.contains_nft(&mint) {
            return Err(NexdrawErrors::NoNftDuplicates.into()); // Adjust error as per your needs
        }
        self.0.push(Prize::Nft { mint });
        Ok(())
    }

    fn add_fixed_asset(&mut self, mint: Pubkey, value: u64) {
        self.0.push(Prize::FixedAsset { mint, value });
    }

    fn contains_nft(&self, mint: &Pubkey) -> bool {
        self.0.iter().any(|prize| {
            match prize {
                Prize::Nft { mint: existing_mint } => existing_mint == mint,
                _ => false,
            }
        })
    }

    pub fn remove_prize(&mut self, prize: &Prize, index: usize) -> Result<()> {
        if self.0.len() <= index {
            return Err(ProgramError::InvalidInstructionData.into()); // Adjust error as per your needs
        }
        if &self.0[index] != prize {
            return Err(ProgramError::InvalidInstructionData.into()); // Adjust error as per your needs
        }
        self.0.remove(index);
        Ok(())
    }

    fn remove_by_index(&mut self, index: usize) -> Option<Prize> {
        if index < self.0.len() { Some(self.0.remove(index)) } else { None }
    }

    fn total_percentage(&self) -> u16 {
        self.0.iter().fold(0, |acc, prize| {
            match prize {
                Prize::Percentage { value } => acc + value,
                _ => acc,
            }
        })
    }
}