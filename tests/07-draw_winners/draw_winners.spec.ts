import * as anchor from '@coral-xyz/anchor';
import { client, createRandomProvider, wait } from '../common';
import { NexDraw, deriveDraw, startDrawParams } from '../../typescript/src';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NexDrawBuilder } from '../context_builder';

describe('draws winners', () => {
  it('does shit', async () => {
    const regent = await new NexDrawBuilder(client)
      .withProvider(createRandomProvider())
      .withInitialFunding(10 * LAMPORTS_PER_SOL)
      .initializeAsDrawRegent(5, 0)
      .build();

    const ticketPrice = new anchor.BN(0);
    const twenty_seconds = 10;
    const timedParams = {
      endTime: new anchor.BN(Date.now() / 1000 + twenty_seconds), // 24 hours from now
      minTicketsSold: 1,
      ticketsForSale: null
    };
    await regent.createDraw(ticketPrice, timedParams);
    const waitTime = wait(12000);
    const drawRegent = regent.drawRegent;
    const drawPubkey = deriveDraw(drawRegent[0], 0);
    try {
      await regent.addPoolPrizeToDraw(drawPubkey[0], 10);
      const nftStartDrawParams: startDrawParams = {
        name: `Test Ticket`,
        symbol: 'NXDRW',
        uri: 'https://ipfs.io/ipfs/bafkreicja2w6txnvco7hhcynm7ubh236kn4xmp3u7msdf4lanctxclt25q/'
      };

      const resD = await regent.startDraw(drawPubkey[0], nftStartDrawParams);
      for (let index = 0; index < 5; index++) {
        await regent.buyTicket(drawPubkey[0]);
      }
      await waitTime;
      await regent.drawWinners(drawPubkey[0]).catch(e => console.log(e));
    } catch (e) {
      console.log(e);
    }
  });
});
