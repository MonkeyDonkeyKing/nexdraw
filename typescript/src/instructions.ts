import { BN, Program } from '@coral-xyz/anchor';
import type { Creator } from '@metaplex-foundation/js';
import { type AccountMeta, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import type { Nexdraw } from './nexdraw';
import {
  EMPEROR_ADDRESS,
  TOKEN_METADATA_PROGRAM_ID,
  deriveDraw,
  deriveDrawMint,
  deriveDrawRegent,
  deriveMasterEdition,
  deriveMetadata
} from './addresses';
import { IdlTimedParams, MethodParams, startDrawParams } from './types';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { z } from 'zod';

/**
 * Create a full transaction for `initialize_emperor`.
 * @export
 * @param {...Parameters<typeof createIinitializeEmperorInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createInitializeEmperorTransaction(
  ...args: Parameters<typeof createInitializeEmperorInstruction>
): Promise<Transaction> {
  const ix = await createInitializeEmperorInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `initialize_emperor` instruction.
 * @export
 * @param {Program<Nexdraw>} program
 * @returns {Promise<TransactionInstruction>}
 */
export async function createInitializeEmperorInstruction(program: Program<Nexdraw>): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error('no public key found on the program provider');
  }
  return program.methods.initializeEmperor().accounts({}).instruction();
}

/**
 * Create a full transaction for `update_emperor_authority`.
 * @export
 * @param {...Parameters<typeof createUpdateEmperorAuthorityInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createUpdateEmperorAuthorityTransaction(
  ...args: Parameters<typeof createUpdateEmperorAuthorityInstruction>
): Promise<Transaction> {
  const ix = await createUpdateEmperorAuthorityInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `update_emperor_authority` instruction.
 * @export
 * @param {Program<Nexdraw>} program
 * @param {PublicKey} newAuthority
 * @returns {Promise<TransactionInstruction>}
 *
 */
export async function createUpdateEmperorAuthorityInstruction(
  program: Program<Nexdraw>,
  newAuthority: MethodParams<'updateEmperor'>
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error('no public key found on the program provider');
  }
  return program.methods.updateEmperor(newAuthority).accounts({}).instruction();
}

/**
 * Create a full transaction for `create_draw_regent`.
 * @export
 * @param {...Parameters<typeof createCreateDrawRegentInstruction>} args
 * @returns {Promise<Transaction>}
 *
 */
export async function createCreateDrawRegentTransaction(
  ...args: Parameters<typeof createCreateDrawRegentInstruction>
): Promise<Transaction> {
  const ix = await createCreateDrawRegentInstruction(...args);
  return new Transaction().add(ix);
}

/**
 *  Create the ix instance for the `create_draw_regent` instruction.
 * @export
 * @param {Program<Nexdraw>} program
 * @param {PublicKey} new_regent
 * @param {number} draws_remaining
 * @param {number} commission
 * @returns {Promise<TransactionInstruction>}
 *
 */
export async function createCreateDrawRegentInstruction(
  program: Program<Nexdraw>,
  new_regent: PublicKey,
  draws_remaining: number,
  commission: number
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error('no public key found on the program provider');
  }
  return program.methods.createDrawRegent(new_regent, draws_remaining, commission).accounts({}).instruction();
}

/**
 * Create a full transaction for `update_draw_regent`.
 * @export
 * @param {...Parameters<typeof createUpdateDrawRegentInstruction>} args
 * @returns {Promise<Transaction>}
 *
 */
export async function createUpdateDrawRegentTransaction(
  ...args: Parameters<typeof createUpdateDrawRegentInstruction>
): Promise<Transaction> {
  const ix = await createUpdateDrawRegentInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `update_draw_regent` instruction.
 * @export
 * @param {Program<Nexdraw>} program
 * @param {number|null} [draws_remaining=null]
 * @param {number|null} [new_emperor_commission=null]
 * @returns {Promise<TransactionInstruction>}
 *
 */
export async function createUpdateDrawRegentInstruction(
  program: Program<Nexdraw>,
  draw_regent: PublicKey,
  draws_remaining: number | null = null,
  new_emperor_commission: number | null = null
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error('no public key found on the program provider');
  }
  return program.methods
    .updateDrawRegent(draws_remaining, new_emperor_commission)
    .accounts({
      drawRegent: draw_regent
    })
    .instruction();
}

/**
 * Create a full transaction for `create_timed_sol_draw`.
 * @export
 * @param {...Parameters<typeof createCreateDrawRegentInstruction>} args
 * @returns {Promise<Transaction>}
 *
 */
export async function createCreateTimedSolDrawTransaction(
  ...args: Parameters<typeof createCreateTimedSolDrawInstruction>
): Promise<Transaction> {
  const ix = await createCreateTimedSolDrawInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `create_timed_sol_draw` instruction.
 * @export
 * @param {Program<Nexdraw>} program
 * @param {BN} ticketPrice
 * @param {IdlTimedParams} timedParams
 * @returns {Promise<TransactionInstruction>}
 *
 */
export async function createCreateTimedSolDrawInstruction(
  program: Program<Nexdraw>,
  ticketPrice: BN,
  timedParams: IdlTimedParams
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error('no public key found on the program provider');
  }
  const regent = deriveDrawRegent(program.provider.publicKey)[0];
  const regentData = await program.account.drawRegent.fetch(regent);
  const draw = deriveDraw(regent, regentData.nextDrawId)[0];

  return program.methods
    .createTimedSolDraw(ticketPrice, timedParams)
    .accounts({
      draw
    })
    .instruction();
}

/**
 * Create a full transaction for the `add_nft_prize` instruction.
 * @export
 * @param {...Parameters<typeof createAddPrizeInstruction>} args
 * @returns {Promise<Transaction>}
 *
 */
export async function createAddNftPrizeTransaction(
  ...args: Parameters<typeof createAddNftPrizeInstruction>
): Promise<Transaction> {
  const ix = await createAddNftPrizeInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `add_nft_prize` instruction.
 * @export
 * @param {Program<Nexdraw>} program
 * @param {PublicKey} draw
 * @param {PublicKey} mint
 * @returns {Promise<TransactionInstruction>}
 *
 */
export async function createAddNftPrizeInstruction(
  program: Program<Nexdraw>,
  draw: PublicKey,
  mint: PublicKey
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error('no public key found on the program provider');
  }
  const [metadata] = deriveMetadata(mint);
  const [masterEdition] = deriveMasterEdition(mint);
  const receiverAta = getAssociatedTokenAddressSync(mint, draw, true);
  const senderAta = getAssociatedTokenAddressSync(mint, program.provider.publicKey);
  const drawRegent = deriveDrawRegent(program.provider.publicKey)[0];
  const drawManager = program.provider.publicKey;

  return program.methods
    .addNftPrize()
    .accounts({
      mint,
      metadata,
      masterEdition,
      receiverAta,
      senderAta,
      drawManager,
      drawRegent,
      draw
    })
    .instruction();
}


/**
 * Create a full transaction for the `add_pool_prize` instruction.
 * @export
 * @param {...Parameters<typeof createAddPrizeInstruction>} args
 * @returns {Promise<Transaction>}
 *
 */
export async function createAddPoolPrizeTransaction(
  ...args: Parameters<typeof createAddPoolPrizeInstruction>
): Promise<Transaction> {
  const ix = await createAddPoolPrizeInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `add_pool_prize` instruction.
 * @export
 * @param {Program<Nexdraw>} program
 * @param {PublicKey} draw
 * @param {number} percentage
 * @returns {Promise<TransactionInstruction>}
 *
 */
export async function createAddPoolPrizeInstruction(
  program: Program<Nexdraw>,
  draw: PublicKey,
  percentage: number
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error('no public key found on the program provider');
  }
  const validatedPercentage = z.number().min(0).max(1000).parse(percentage);
  const drawRegent = deriveDrawRegent(program.provider.publicKey)[0];
  const drawManager = program.provider.publicKey;

  return program.methods
    .addPoolPrize(validatedPercentage)
    .accounts({
      drawManager,
      drawRegent,
      draw
    })
    .instruction();
}

/**
 * Create a full transaction for the `start_draw` instruction.
 * @export
 * @param {...Parameters<typeof createStartDrawInstruction>} args
 * @returns {Promise<Transaction>}
 *
 */
export async function createStartDrawTransaction(
  ...args: Parameters<typeof createStartDrawInstruction>
): Promise<Transaction> {
  const ix = await createStartDrawInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `start_draw` instruction.
 * @export
 * @param {Program<Nexdraw>} program
 * @param {PublicKey} draw
 * @param {startDrawParams} params
 * @returns {Promise<TransactionInstruction>}
 *
 */
export async function createStartDrawInstruction(
  program: Program<Nexdraw>,
  draw: PublicKey,
  params: startDrawParams
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error('no public key found on the program provider');
  }
  const [mint] = deriveDrawMint(draw);
  const [metadata] = deriveMetadata(mint);
  const [masterEdition] = deriveMasterEdition(mint);
  const tokenAccount = getAssociatedTokenAddressSync(mint, draw, true);

  return program.methods
    .startDraw(params)
    .accounts({
      draw,
      metadata,
      masterEdition,
      tokenAccount,
      metadataProgram: TOKEN_METADATA_PROGRAM_ID
    })
    .instruction();
}
