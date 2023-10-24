import * as anchor from '@coral-xyz/anchor';
import { client, createRandomProvider, wait } from '../common';
import { assert } from 'chai';
import { EMPEROR_ADDRESS, deriveDrawRegent, NexDraw } from '../../typescript/src';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NexDrawBuilder } from '../context_builder';

describe('draw_regent functionalities', () => {
  describe('Initialization checks', () => {
    describe('check nexdrawbuilder regent correct', async () => {
      let regent: NexDraw;
      it('Builds a drawRegent', async () => {
        regent = await new NexDrawBuilder(client)
          .withProvider(createRandomProvider())
          .withInitialFunding(10 * LAMPORTS_PER_SOL)
          .initializeAsDrawRegent(5, 0)
          .build();
      });
      it('Checks the drawRegent', async () => {
        let drawRegentAccount = deriveDrawRegent(regent.provider.publicKey);
        let drawRegentData = await regent.program.account.drawRegent.fetch(drawRegentAccount[0]);
        assert.ok(drawRegentData.drawManager.equals(regent.provider.publicKey));
        assert.ok(drawRegentData.emperorPercentCommission == 0);
        assert.ok(drawRegentData.drawsRemaining == 5);
        assert.ok(drawRegentData.nextDrawId == 0);
        regent.provider.connection.getBalance(regent.provider.publicKey).then(balance => {
          assert.ok(balance > 1 * LAMPORTS_PER_SOL);
        });
      });
    });
    describe('emperor checks', async () => {
      describe('emperor initializes draw_regent', async () => {
        let drawRegent = anchor.web3.Keypair.generate();
        let drawsRemaining = 5;
        let commission = 5;
        it('calls initializeDrawRegent', async () => {
          await client.createDrawRegent(drawRegent.publicKey, drawsRemaining, commission);
          await wait(1000);
        });
        it('checks if draw_regent is initialized', async () => {
          let drawRegentAccount = deriveDrawRegent(drawRegent.publicKey);
          let drawRegentData = await client.program.account.drawRegent.fetch(drawRegentAccount[0]);
          assert.ok(drawRegentData.drawManager.equals(drawRegent.publicKey));
          assert.ok(drawRegentData.emperorPercentCommission == commission);
          assert.ok(drawRegentData.drawsRemaining == drawsRemaining);
          assert.ok(drawRegentData.nextDrawId == 0);
        });
      });
      describe('non emperor tries to initialize draw_regent', async () => {
        let weakAccess = await new NexDrawBuilder(client)
          .withProvider(createRandomProvider())
          .withInitialFunding(1 * LAMPORTS_PER_SOL)
          .build();
        try {
          const pda = deriveDrawRegent(weakAccess.provider.publicKey);
          weakAccess.provider.connection.getBalance(weakAccess.provider.publicKey).then(balance => {
            assert.ok(balance > 1 * LAMPORTS_PER_SOL);
          });
          await weakAccess.program.methods
            .createDrawRegent(weakAccess.provider.publicKey, 0, 0)
            .accounts({
              drawRegent: pda[0]
            })
            .rpc();
        } catch (err) {
          const e = err as anchor.AnchorError;
          assert.strictEqual(e.error.origin, 'emperor');
          assert.strictEqual(e.error.errorMessage, 'A has one constraint was violated');
        }
      });
    });
    describe('Try to initialize with wrong commission', async () => {
      let drawRegent = anchor.web3.Keypair.generate();
      let drawsRemaining = 5;
      let commission = 10001;
      it('calls initializeDrawRegent', async () => {
        await client.createDrawRegent(drawRegent.publicKey, drawsRemaining, commission).catch(err => {
          const e = err as anchor.AnchorError;
          assert.ok(e.logs.reduce((prev, curr) => prev + curr).includes('InvalidPercentage'));
        });
        await wait(1000);
      });
    });
  });
  describe('updateDrawRegent', async () => {
    let drawRegent: NexDraw;
    let drawRegentAccount: anchor.web3.PublicKey;
    let drawsRemaining = 5;
    let commission = 5;
    it('Builds a drawRegent', async () => {
      drawRegent = await new NexDrawBuilder(client)
        .withProvider(createRandomProvider())
        .withInitialFunding(10 * LAMPORTS_PER_SOL)
        .initializeAsDrawRegent(drawsRemaining, commission)
        .build();
      drawRegentAccount = deriveDrawRegent(drawRegent.provider.publicKey)[0];
    });
    it('Updates drawRegent', async () => {
      await client.updateDrawRegent(drawRegentAccount, drawsRemaining - 1, commission + 1);
      await wait(1000);
    });
    it('Checks the drawRegent', async () => {
      let drawRegentData = await drawRegent.program.account.drawRegent.fetch(drawRegentAccount);
      assert.ok(drawRegentData.drawManager.equals(drawRegent.provider.publicKey));
      assert.ok(drawRegentData.emperorPercentCommission == commission + 1);
      assert.ok(drawRegentData.drawsRemaining == drawsRemaining - 1);
      assert.ok(drawRegentData.nextDrawId == 0);
    });
    it('updates to invalid commission', async () => {
      await client.updateDrawRegent(drawRegentAccount, drawsRemaining - 1, 10001).catch(err => {
        const e = err as anchor.AnchorError;
        assert.ok(e.logs.reduce((prev, curr) => prev + curr).includes('InvalidPercentage'));
      });
    });
    it('updates with a negative drawsRemaining', async () => {
      await client.updateDrawRegent(drawRegentAccount, -1, commission + 1).catch(err => {
        const e = err as anchor.AnchorError;
        assert.ok(e.logs.reduce((prev, curr) => prev + curr).includes('InvalidDrawsRemaining'));
      });
    });
  });
});
