import * as anchor from '@coral-xyz/anchor';
import { client, wait } from '../common';
import { assert } from 'chai';
import { EMPEROR_ADDRESS } from '../../typescript/src/addresses';
import { NexDraw } from '../../typescript/src';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

describe('Emperor functionalities', () => {
  let emperorAddress = EMPEROR_ADDRESS[0];

  describe('Initialization', () => {
    it('should send an initialization function for the emperor', async () => {
      const a = await client.createEmperor();
      assert.ok(a);
    });

    it('should check if the emperor is initialized', async () => {
      const emperor = await client.program.account.emperor.fetch(emperorAddress);
      assert.ok(emperor.authority.equals(client.provider.publicKey));
    });

    it('should not allow initializing the emperor more than once', async () => {
      try {
        await client.createEmperor();
        assert.fail('Expected an error, but none was thrown.');
      } catch (err) {
        const e = err as anchor.web3.SimulatedTransactionResponse;
        assert.strictEqual(
          e.logs[3],
          'Allocate: account Address { address: H8rALSpjfrCYkbEJDWwXRrQ6oVaYaerQ2YJwNeWgTgMx, base: None } already in use'
        );
      }
    });
  });

  describe('Updates', () => {
    // Include tests specific to emperor updates here
  });

  describe('Security', () => {
    const hacker_one = new NexDraw(
      new anchor.AnchorProvider(client.provider.connection, new anchor.Wallet(Keypair.generate()), {})
    );

    const hacker_two = new NexDraw(
      new anchor.AnchorProvider(client.provider.connection, new anchor.Wallet(Keypair.generate()), {})
    );

    before(async () => {
      await client.provider.connection.requestAirdrop(hacker_one.provider.publicKey, 1 * LAMPORTS_PER_SOL);
      await client.provider.connection.requestAirdrop(hacker_two.provider.publicKey, 1 * LAMPORTS_PER_SOL);
      await wait(1000);
    });

    it('should prevent unauthorized reinitialization of the emperor', async () => {
      try {
        await hacker_one.createEmperor();
        assert.fail('Expected an error, but none was thrown.');
      } catch (err) {
        const e = err as anchor.web3.SimulatedTransactionResponse;
        assert.strictEqual(
          e.logs[3],
          'Allocate: account Address { address: H8rALSpjfrCYkbEJDWwXRrQ6oVaYaerQ2YJwNeWgTgMx, base: None } already in use'
        );
      }
    });

    it("should prevent unauthorized users from updating the emperor's authority", async () => {
      try {
        await hacker_two.updateEmperor(hacker_two.provider.publicKey);
        assert.fail('Expected an error, but none was thrown.');
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorMessage, 'A has one constraint was violated');
      }
    });
  });

  // If there are any other categories of tests, you can add another describe block similar to the ones above
});
