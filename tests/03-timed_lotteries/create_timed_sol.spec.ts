import * as anchor from '@coral-xyz/anchor';
import { client, createRandomProvider } from '../common';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { NexDrawBuilder } from '../context_builder';
import { deriveDraw, deriveDrawRegent } from '../../typescript/src';

describe('timed_sol_draw', () => {
  it('creates a draw as regent', async () => {
    const regent = await new NexDrawBuilder(client)
      .withProvider(createRandomProvider())
      .withInitialFunding(10 * LAMPORTS_PER_SOL)
      .initializeAsDrawRegent(5, 0)
      .build();

    // await regent
    //   .createDraw(
    //     {
    //       endTime: new anchor.BN(Date.now() + 1000 * 60 * 60 * 24),
    //       minTicketsSold: 1,
    //       ticketsForSale: null
    //     },
    //     new anchor.BN(0),
    //     0
    //   )
    //   .catch(err => {
    //     console.log(err);
    //   });
    const a = await regent.program.methods
      .createTimedSolDraw(
        new anchor.BN(0),
        {
          endTime: new anchor.BN(Date.now() + 1000 * 60 * 60 * 24),
          minTicketsSold: 1,
          ticketsForSale: null
        },
        0
      )
      .accounts({})
      .rpc()
      .catch(err => {
        console.log(err);
      });
  });
});
