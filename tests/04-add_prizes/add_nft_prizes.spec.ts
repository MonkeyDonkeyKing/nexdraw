import * as anchor from '@coral-xyz/anchor';
import { client, createRandomProvider, wait } from '../common';
import { assert } from 'chai';
import { createAddNftPrizeInstruction, deriveDraw } from '../../typescript/src';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { NexDrawBuilder } from '../context_builder';
import createNft from '../testingutils/createNft';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

describe('TimedSolDraw Functionality', () => {
  it('adds a prize to a draw concept', async () => {
    const regent = await new NexDrawBuilder(client)
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
    // @ts-expect-error
    const nft = await createNft(regent.provider.connection, regent.program.provider.wallet.payer);

    await regent.createDraw(ticketPrice, timedParams);
    const drawRegent = regent.drawRegent;
    const drawPubkey = deriveDraw(drawRegent[0], 0);
    const prizeix = await createAddNftPrizeInstruction(regent.program, drawPubkey[0], nft.mintAddress!);
    const res = await regent.addNftPrizeToDraw(drawPubkey[0], nft.mintAddress!);
    // check the token balance of the draw
    const draw = await regent.program.account.draw.fetch(drawPubkey[0]);
    assert.strictEqual(draw.drawInfo.prizes.prizes.length, 1);
    assert.strictEqual(draw.drawInfo.prizes.prizes[0].nft.mint.toString(), nft.mintAddress!.toString());
    const associatedMintPubkey = getAssociatedTokenAddressSync(nft.mintAddress!, drawPubkey[0], true);
    const associatedMint = await regent.provider.connection.getParsedAccountInfo(associatedMintPubkey);
    // @ts-expect-error
    assert.strictEqual(associatedMint.value.data.parsed.info.tokenAmount.uiAmount, 1);
    // const a = await createStartDrawInstruction(regent.program, drawPubkey[0], {
    //   name: 'test',
    //   uri: 'test',
    //   symbol: 'test'
    // }).catch(err => {
    //   console.log(err);
    // });
    await regent
      .startDraw(drawPubkey[0], { name: 'test', uri: 'test', symbol: 'test' })
      .catch(err => {
        console.log(err);
      })
      .then(res => {
        console.log(res);
      });
  });
});
