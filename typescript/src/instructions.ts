import { BN, Program } from '@coral-xyz/anchor';
import type { Creator } from '@metaplex-foundation/js';
import { type AccountMeta, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import type { Nexdraw } from './nexdraw';
import { EMPEROR_ADDRESS } from './addresses';
import { MethodParams } from './types';

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
 * @param {PublicKey} regent_key
 * @param {number} draws_remaining
 * @param {number} commission
 * @returns {Promise<TransactionInstruction>}
 *
 */
export async function createCreateDrawRegentInstruction(
  program: Program<Nexdraw>,
  regent_key: PublicKey,
  draws_remaining: number,
  commission: number
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error('no public key found on the program provider');
  }
  return program.methods.createDrawRegent(regent_key, draws_remaining, commission).accounts({}).instruction();
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
