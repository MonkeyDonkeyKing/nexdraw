use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct Winner {
    pub ticket_id: u32,
    pub claimed: bool,
}

impl Winner {
    pub const SIZE: usize = 4 + 1;

    pub fn new(ticket_id: u32) -> Self {
        Self {
            ticket_id,
            claimed: false,
        }
    }
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub struct Winners { 
    pub winners: Vec<Winner>,
}

impl Winners {
    pub fn size(max_size: usize) -> usize {
        Winner::SIZE * max_size
    }

    pub fn new() -> Self {
        Self {
            winners: vec![],
        }
    }

    pub fn len(&self) -> usize {
        self.winners.len()
    }

    pub fn add_winner(&mut self, ticket_id: u32) -> Result<()> {
        if self.contains_ticket_id(ticket_id) {
            return Err(ProgramError::InvalidInstructionData.into()); // Ticket ID already a winner
        }
        self.winners.push(Winner::new(ticket_id));
        Ok(())
    }

    pub fn claim_winner(&mut self, ticket_id: u32) -> Result<()> {
        if let Some(winner) = self.winners.iter_mut().find(|w| w.ticket_id == ticket_id) {
            if winner.claimed {
                return Err(ProgramError::InvalidInstructionData.into()); // Ticket already claimed
            }
            winner.claimed = true;
            Ok(())
        } else {
            Err(ProgramError::InvalidAccountData.into()) // Ticket ID not found
        }
    }

    pub fn is_claimed(&self, ticket_id: u32) -> bool {
        self.winners
            .iter()
            .any(|winner| winner.ticket_id == ticket_id && winner.claimed)
    }

    fn contains_ticket_id(&self, ticket_id: u32) -> bool {
        self.winners.iter().any(|winner| winner.ticket_id == ticket_id)
    }
}