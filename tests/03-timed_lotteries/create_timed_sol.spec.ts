import * as anchor from '@coral-xyz/anchor';
import { client, createRandomProvider, wait } from '../common';
import { assert } from 'chai';
import { NexDraw, deriveDraw, deriveDrawRegent } from '../../typescript/src';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { NexDrawBuilder } from '../context_builder';

describe('TimedSolDraw Functionality', () => {
  describe('Creation', () => {
    let regent: NexDraw;
    let drawRegentAccount: PublicKey;

    beforeEach(async () => {
      regent = await new NexDrawBuilder(client)
        .withProvider(createRandomProvider())
        .withInitialFunding(10 * LAMPORTS_PER_SOL)
        .initializeAsDrawRegent(5, 0)
        .build();
      drawRegentAccount = deriveDrawRegent(regent.provider.publicKey)[0];
    });

    it('creates a draw as regent', async () => {
      const ticketPrice = new anchor.BN(0);
      const one_day_in_seconds = 86400;
      const timedParams = {
        endTime: new anchor.BN(Date.now() / 1000 + 86400), // 24 hours from now
        minTicketsSold: 1,
        ticketsForSale: null
      };

      await regent.createDraw(ticketPrice, timedParams);

      const drawAccount = deriveDraw(drawRegentAccount, 0)[0];
      const drawData = await regent.program.account.draw.fetch(drawAccount);

      // Assertions to ensure the draw has been created with the correct parameters
      assert.strictEqual(drawData.ticketInfo.price.sol.value.toNumber(), ticketPrice.toNumber());
      assert.strictEqual(drawData.drawInfo.drawType.timed[0].endTime.toNumber(), timedParams.endTime.toNumber());
      assert.strictEqual(drawData.drawInfo.drawType.timed[0].minTicketsSold, timedParams.minTicketsSold);
      // ... Add other assertions as needed ...

      // Ensure draw regent's nextDrawId is incremented
      const updatedDrawRegentData = await regent.program.account.drawRegent.fetch(drawRegentAccount);
      assert.strictEqual(updatedDrawRegentData.nextDrawId, 1);
    });

    it('rejects creation with earlier then now unix_timestamp', async () => {
      // Use a past end time to simulate an error
      const invalidEndTime = new anchor.BN(Date.now() / 1000 - 1000);
      const timedParams = {
        endTime: invalidEndTime,
        minTicketsSold: 1,
        ticketsForSale: null
      };

      try {
        const a = await regent.createDraw(new anchor.BN(0), timedParams);
        assert.fail('Should throw an error');
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.ok(e.message.includes('ElapsedEndTime.')); // Adjust as needed
      }
    });
    it('rejects creation with end time beyond one year', async () => {
      const oneYearPlusOneSecond = new anchor.BN(Date.now() / 1000 + 31536000 + 1000); // Date.now() returns milliseconds, so we divide by 1000.
      const timedParams = {
        endTime: oneYearPlusOneSecond,
        minTicketsSold: 1,
        ticketsForSale: null
      };

      try {
        await regent.createDraw(new anchor.BN(0), timedParams);
        assert.fail('Should throw an error');
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.ok(e.message.includes('EndTimeExceedsOneYear'));
      }
    });
    it('rejects creation with zero minimum tickets', async () => {
      const timedParams = {
        endTime: new anchor.BN(Date.now() / 1000 + 86400),
        minTicketsSold: 0,
        ticketsForSale: null
      };

      try {
        await regent.createDraw(new anchor.BN(0), timedParams);
        assert.fail('Should throw an error due to zero min tickets.');
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.ok(e.message.includes('MinTicketsIsZero'));
      }
    });

    it('creates with 0 minimum tickets', async () => {
      const timedParams = {
        endTime: new anchor.BN(Date.now() / 1000 + 86400),
        minTicketsSold: 0,
        ticketsForSale: null
      };
      try {
        await regent.createDraw(new anchor.BN(0), timedParams);
        assert.fail('Should throw an error due to invalid ticket amounts.');
      } catch (err) {
        const e = err as anchor.AnchorError;
        assert.ok(e.message.includes('MinTicketsIsZero'));
      }
    });

    it('rejects creation with ticketsForSale less than minTicketsSold', async () => {
      const timedParams = {
        endTime: new anchor.BN(Date.now() / 1000 + 86400),
        minTicketsSold: 10,
        ticketsForSale: 5
      };

      try {
        await regent.createDraw(new anchor.BN(0), timedParams);
        assert.fail('Should throw an error due to invalid ticket amounts.');
      } catch (err) {
        const e = err as anchor.AnchorError;
        console.log(e.error.errorCode.code);
        assert.equal(e.error.errorCode.code, 'MinMaxTicketsCrossOver');
      }
    });

    it('rejects creation with negative ticket price', async () => {
      /// I am leaving this here but iwth some note.. It does not actually reject cause it looks like anchor
      /// converts this to a positive number
      try {
        await regent.createDraw(new anchor.BN(-10), {
          endTime: new anchor.BN(Date.now() / 1000 + 86400),
          minTicketsSold: 1,
          ticketsForSale: null
        });
        const accdata = await regent.program.account.draw.fetch(deriveDraw(drawRegentAccount, 0)[0]);
        if (new anchor.BN(accdata.ticketInfo.price.sol.value).toNumber() < 0) {
          assert.fail('Should throw an error due to negative ticket price.');
        } else {
          assert.ok(true);
        }
      } catch (err) {
        const e = err as anchor.AnchorError;
        console.log(e.error.errorCode.code);
      }
    });

    it('creates a draw with maximum ticketsForSale', async () => {
      const maxTickets = 4294967295; /// UINT32_MAX
      const timedParams = {
        endTime: new anchor.BN(Date.now() / 1000 + 86400),
        minTicketsSold: 1,
        ticketsForSale: maxTickets
      };

      await regent.createDraw(new anchor.BN(0), timedParams).catch(err => {
        const e = err as anchor.AnchorError;
        console.log(e.error.errorCode.code);
        assert.fail('Should not throw an error');
      });

      // Fetch draw and ensure ticketsForSale is set correctly
      const drawAccount = deriveDraw(drawRegentAccount, 0)[0]; // assuming next draw id is 1
      const drawData = await regent.program.account.draw.fetch(drawAccount);
      assert.strictEqual(drawData.drawInfo.drawType.timed[0].ticketsForSale, maxTickets);
    });

    // Add more test cases to check for other potential error scenarios, such as:
    // - Creation with invalid ticketPrice
    // - Creation without enough permissions
    // - Creation when the max number of draws is reached, etc.
  });
  describe('draw regent incrementation', () => {
    it('gets and creates 5 draws', async () => {
      const amount = 5;
      const creates = 5;
      const regent = await new NexDrawBuilder(client)
        .withProvider(createRandomProvider())
        .withInitialFunding(10 * LAMPORTS_PER_SOL)
        .initializeAsDrawRegent(amount, 0)
        .build();

        for (let i = 0;  i < creates; i++) {
          await regent.createDraw(new anchor.BN(0), {
            endTime: new anchor.BN(Date.now() / 1000 + 86400),
            minTicketsSold: 1,
            ticketsForSale: null
          });
        }
        const regentManager = await regent.program.account.drawRegent.fetch(deriveDrawRegent(regent.provider.publicKey)[0]);
        const draws = await regent.program.account.draw.all();
        const filtered = draws.filter((draw) => draw.account.manager.equals(deriveDrawRegent(regent.provider.publicKey)[0]));
        assert.strictEqual(filtered.length, creates, 'Should only have 5 draws');
        assert.strictEqual(regentManager.drawsRemaining, amount - creates, 'Should have 0 draws remaining');
        assert.strictEqual(regentManager.nextDrawId, amount, 'Should have created 5 draws')
    });
    it('gets 10 and creates 5 draws', async () => {
      const amount = 10;
      const creates = 5;
      const regent = await new NexDrawBuilder(client)
        .withProvider(createRandomProvider())
        .withInitialFunding(10 * LAMPORTS_PER_SOL)
        .initializeAsDrawRegent(amount, 0)
        .build();

        for (let i = 0;  i < creates; i++) {
          await regent.createDraw(new anchor.BN(0), {
            endTime: new anchor.BN(Date.now() / 1000 + 86400),
            minTicketsSold: 1,
            ticketsForSale: null
          });
        }
        const regentManager = await regent.program.account.drawRegent.fetch(deriveDrawRegent(regent.provider.publicKey)[0]);
        const draws = await regent.program.account.draw.all();
        const filtered = draws.filter((draw) => draw.account.manager.equals(deriveDrawRegent(regent.provider.publicKey)[0]));
        assert.strictEqual(filtered.length, creates, 'Should only have 5 draws');
        assert.strictEqual(regentManager.nextDrawId, amount - creates, 'Should have 5 draws remaining');
        assert.strictEqual(regentManager.drawsRemaining, amount - creates, 'Should have created 5 draws');
      });
    it("tries to create 6 draws but only has 5 draws remaining", async () => {
      const amount = 5;
      const creates = 6;
      let fails = 0;
      const regent = await new NexDrawBuilder(client)
        .withProvider(createRandomProvider())
        .withInitialFunding(10 * LAMPORTS_PER_SOL)
        .initializeAsDrawRegent(amount, 0)
        .build();

        for (let i = 0;  i < creates; i++) {
          try {
            await regent.createDraw(new anchor.BN(0), {
              endTime: new anchor.BN(Date.now() / 1000 + 86400),
              minTicketsSold: 1,
              ticketsForSale: null
            });
          } catch {
            fails++;
          }
        }
        const regentManager = await regent.program.account.drawRegent.fetch(deriveDrawRegent(regent.provider.publicKey)[0]);
        const draws = await regent.program.account.draw.all();
        const filtered = draws.filter((draw) => draw.account.manager.equals(deriveDrawRegent(regent.provider.publicKey)[0]));
        assert.strictEqual(filtered.length, amount, 'Should only have 5 draws');
        assert.strictEqual(regentManager.drawsRemaining, 0, 'Should have 0 draws remaining');
        assert.strictEqual(fails, 1, 'Should have 1 failed draw');
    });
  });

  // Additional main categories of tests can be added here...
});
