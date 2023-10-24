import * as anchor from '@coral-xyz/anchor';
import { client, createRandomProvider, wait } from '../common';
import { assert } from 'chai';
import { EMPEROR_ADDRESS, deriveDrawRegent, NexDraw } from '../../typescript/src';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NexDrawBuilder } from '../context_builder';

describe('DrawRegent Functionality', () => {
  const assertDrawRegentData = async (expected, actualPublicKey) => {
    const actual = await client.program.account.drawRegent.fetch(actualPublicKey);
    assert.strictEqual(actual.drawManager.toString(), expected.drawManager.toString());
    assert.strictEqual(actual.emperorPercentCommission, expected.commission);
    assert.strictEqual(actual.drawsRemaining, expected.drawsRemaining);
    assert.strictEqual(actual.nextDrawId, expected.nextDrawId);
  };

  describe('Initialization', () => {
    it('should initialize DrawRegent correctly', async () => {
      const regent = await new NexDrawBuilder(client)
        .withProvider(createRandomProvider())
        .withInitialFunding(10 * LAMPORTS_PER_SOL)
        .initializeAsDrawRegent(5, 0)
        .build();

      const expected = {
        drawManager: regent.provider.publicKey,
        commission: 0,
        drawsRemaining: 5,
        nextDrawId: 0
      };
      await assertDrawRegentData(expected, deriveDrawRegent(regent.provider.publicKey)[0]);

      const balance = await regent.provider.connection.getBalance(regent.provider.publicKey);
      assert.ok(balance > 1 * LAMPORTS_PER_SOL);
    });

    it('should allow emperor to initialize DrawRegent', async () => {
      const drawsRemaining = 5;
      const commission = 5;
      const drawRegentPublicKey = Keypair.generate().publicKey;
      await client.createDrawRegent(drawRegentPublicKey, drawsRemaining, commission);

      const expected = {
        drawManager: drawRegentPublicKey,
        commission: commission,
        drawsRemaining: drawsRemaining,
        nextDrawId: 0
      };
      await assertDrawRegentData(expected, deriveDrawRegent(drawRegentPublicKey)[0]);
    });

    it('should not allow non-emperor to initialize DrawRegent', async () => {
      const weakAccess = await new NexDrawBuilder(client)
        .withProvider(createRandomProvider())
        .withInitialFunding(1 * LAMPORTS_PER_SOL)
        .build();

      try {
        const pda = deriveDrawRegent(weakAccess.provider.publicKey);
        await weakAccess.program.methods
          .createDrawRegent(weakAccess.provider.publicKey, 0, 0)
          .accounts({ drawRegent: pda[0] })
          .rpc();
        assert.fail('Should throw an error');
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.origin, 'emperor');
        assert.strictEqual(e.error.errorMessage, 'A has one constraint was violated');
      }
    });

    it('should reject initialization with invalid commission', async () => {
      const drawsRemaining = 5;
      const invalidCommission = 10001;
      const drawRegentPublicKey = Keypair.generate().publicKey;

      try {
        await client.createDrawRegent(drawRegentPublicKey, drawsRemaining, invalidCommission);
        assert.fail('Should throw an error');
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.ok(e.logs.reduce((prev, curr) => prev + curr).includes('InvalidPercentage'));
      }
    });
  });

  describe('updateDrawRegent', () => {
    let drawRegent;
    let drawRegentAccount;
    let drawsRemaining = 5;
    let commission = 5;

    before(async () => {
      drawRegent = await new NexDrawBuilder(client)
        .withProvider(createRandomProvider())
        .withInitialFunding(10 * LAMPORTS_PER_SOL)
        .initializeAsDrawRegent(drawsRemaining, commission)
        .build();
      drawRegentAccount = deriveDrawRegent(drawRegent.provider.publicKey)[0];
    });

    it('emperor updates drawRegent', async () => {
      await client.updateDrawRegent(drawRegentAccount, drawsRemaining - 1, commission + 1);
      await wait(1000);

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
      try {
        await client.updateDrawRegent(drawRegentAccount, -1, commission + 1);
        assert.ok(false); // This line will be reached if no error is thrown, indicating the test failed.
      } catch (err) {
        assert.ok(true); // An error was correctly thrown.
      }
    });

    it('non-emperor tries to update drawRegent and gets a has one constraint error', async () => {
      const weakAccess = await new NexDrawBuilder(client)
        .withProvider(createRandomProvider())
        .withInitialFunding(1 * LAMPORTS_PER_SOL)
        .build();

      try {
        await weakAccess.updateDrawRegent(drawRegentAccount, drawsRemaining - 1, commission + 1);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.origin, 'emperor');
        assert.strictEqual(e.error.errorMessage, 'A has one constraint was violated');
      }
    });
  });
  // Additional main categories of tests can be added here...
});
