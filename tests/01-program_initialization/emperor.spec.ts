import * as anchor from '@coral-xyz/anchor';
import { client, wait } from '../common';
import { assert } from 'chai';
import { EMPEROR_ADDRESS } from '../../typescript/src/addresses';
import { NexDraw } from '../../typescript/src';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

describe('Emperor functionalities', () => {
  describe('initializes the emperor', () => {
    // Removed async here
    it('Sends initialization function for the emperor', async () => {
      const a = await client.createEmperor();
      assert.ok(a);
    });
    it('Checks if the emperor is initialized', async () => {
      const emperor = await client.program.account.emperor.fetch(EMPEROR_ADDRESS[0]);
      assert.ok(emperor.authority.equals(client.provider.publicKey));
    });
  });
  describe('updates the emperor', () => {
    it('calls initialize more than once', async () => {
      try {
        await client.createEmperor();
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.web3.SimulatedTransactionResponse;
        assert.strictEqual(
          e.logs[3],
          'Allocate: account Address { address: H8rALSpjfrCYkbEJDWwXRrQ6oVaYaerQ2YJwNeWgTgMx, base: None } already in use'
        );
      }
    });
  });
  describe('tries to hack the emperor', () => {
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
    it('hacker tries to reinitialize the emperor', async () => {
      try {
        await hacker_one.createEmperor();
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.web3.SimulatedTransactionResponse;
        assert.strictEqual(
          e.logs[3],
          'Allocate: account Address { address: H8rALSpjfrCYkbEJDWwXRrQ6oVaYaerQ2YJwNeWgTgMx, base: None } already in use'
        );
      }
    });
    it("hacker tries to update the emperor's authority", async () => {
      try {
        await hacker_two.updateEmperor(hacker_two.provider.publicKey);
        assert.ok(false);
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.strictEqual(e.error.errorMessage, 'A has one constraint was violated');
      }
    });
  });
});
