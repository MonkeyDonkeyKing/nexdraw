import * as anchor from '@coral-xyz/anchor';
import { client, createRandomProvider } from '../common';
import { assert } from 'chai';
import { NexDraw, createAddPoolPrizeInstruction, deriveDraw, deriveDrawRegent } from '../../typescript/src';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NexDrawBuilder } from '../context_builder';

describe('TimedSolDraw add pool prize functionality', () => {
  let drawRegent: [anchor.web3.PublicKey, number], 
      drawPubkey: [anchor.web3.PublicKey, number], 
      regent: NexDraw;

  it('adds one pool prize to a lottery concept', async () => {
    regent = await new NexDrawBuilder(client)
      .withProvider(createRandomProvider())
      .withInitialFunding(10 * LAMPORTS_PER_SOL)
      .initializeAsDrawRegent(5, 0)
      .build();

    const ticketPrice = new anchor.BN(0);
    const one_day_in_seconds = 86400;
    const timedParams = {
      endTime: new anchor.BN(Date.now() / 1000 + 86400), // 24 hours from now
      minTicketsSold: 1,
      ticketsForSale: null
    };

    await regent.createDraw(ticketPrice, timedParams);

    drawRegent = regent.drawRegent;
    drawPubkey = deriveDraw(drawRegent[0], 0);

    const prize = 10;

    const prizeix = await createAddPoolPrizeInstruction(regent.program, drawPubkey[0], prize);
    const res = await regent.addPoolPrizeToDraw(drawPubkey[0], prize);

    const draw = await regent.program.account.draw.fetch(drawPubkey[0]);

    assert.strictEqual(draw.drawInfo.prizes.prizes.length, 1);
    assert.strictEqual(draw.drawInfo.prizes.prizes[0].percentage?.value, prize);
  })

  it('adds second pool prize to same lottery concept', async () => {
    const prize = 20;
    const prizeix = await createAddPoolPrizeInstruction(regent.program, drawPubkey[0], prize);
    const res = await regent.addPoolPrizeToDraw(drawPubkey[0], prize);

    const draw = await regent.program.account.draw.fetch(drawPubkey[0]);

    assert.strictEqual(draw.drawInfo.prizes.prizes.length, 2);
    assert.strictEqual(draw.drawInfo.prizes.prizes[1].percentage?.value, prize);

  })

});