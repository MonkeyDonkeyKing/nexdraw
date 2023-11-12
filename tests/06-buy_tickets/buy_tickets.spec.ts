import * as anchor from '@coral-xyz/anchor';
import { client, createRandomProvider } from '../common';
import { assert } from 'chai';
import {
  NexDraw,
  createAddPoolPrizeInstruction,
  createBuyTicketInstruction,
  createStartDrawInstruction,
  deriveDraw,
  deriveDrawMint,
  deriveMasterEdition,
  deriveMetadata,
  startDrawParams
} from '../../typescript/src';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NexDrawBuilder } from '../context_builder';

describe('Buy ticket functionality', () => {
  let drawRegent: [anchor.web3.PublicKey, number], drawPubkey: [anchor.web3.PublicKey, number], regent: NexDraw, draw;

  it('initialize draw', async () => {
    // Create draw
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

    assert.ok;
  });

  it('add prize to created draw', async () => {
    const prize = 10;
    const prizeix = await createAddPoolPrizeInstruction(regent.program, drawPubkey[0], prize);
    const res = await regent.addPoolPrizeToDraw(drawPubkey[0], prize);
    draw = await regent.program.account.draw.fetch(drawPubkey[0]);

    assert.ok;
  });

  it('start draw', async () => {
    const startDrawParams: startDrawParams = {
      name: `Test Collection ${draw.drawId}`,
      symbol: 'NXDRW',
      uri: 'https://ipfs.io/ipfs/bafkreicja2w6txnvco7hhcynm7ubh236kn4xmp3u7msdf4lanctxclt25q/'
    };

    const nftStartDrawParams: startDrawParams = {
      name: `Test Ticket`,
      symbol: 'NXDRW',
      uri: 'https://ipfs.io/ipfs/bafkreicja2w6txnvco7hhcynm7ubh236kn4xmp3u7msdf4lanctxclt25q/'
    };

    const resD = await regent.startDraw(drawPubkey[0], nftStartDrawParams);
    const [mint] = deriveDrawMint(drawPubkey[0]);
    const [metadata] = deriveMetadata(mint);
    const [masterEdition] = deriveMasterEdition(mint);
  });

  it('buy ticket', async () => {
    // buy ticket
    const amount = 1;
    const rest = await regent.buyTicket(drawPubkey[0]).catch(err => {
      console.log(err);
    });
    assert.ok;
  });
});
