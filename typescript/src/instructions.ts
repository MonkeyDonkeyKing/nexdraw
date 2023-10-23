import { BN, Program } from "@coral-xyz/anchor";
import type { Creator } from "@metaplex-foundation/js";
import {
  type AccountMeta,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import type { Nexdraw } from "./nexdraw";
import { EMPEROR_ADDRESS } from "./addresses";

/**
 * Create a full transaction for `create_app_xnft`.
 * @export
 * @param {...Parameters<typeof createIinitializeEmperorInstruction>} args
 * @returns {Promise<Transaction>}
 */
export async function createInitializeEmperorTransaction(
  ...args: Parameters<typeof createIinitializeEmperorInstruction>
): Promise<Transaction> {
  const ix = await createIinitializeEmperorInstruction(...args);
  return new Transaction().add(ix);
}

/**
 * Create the ix instance for the `initialize_emperor` instruction.
 * @export
 * @param {Program<Nexdraw>} program
 * @returns {Promise<TransactionInstruction>}
 */
export async function createIinitializeEmperorInstruction(
  program: Program<Nexdraw>
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error("no public key found on the program provider");
  }
  return program.methods.initializeEmperor().accounts({}).instruction();
}

/**
 * Update the authority of the emperor account.
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
  newAuthority: PublicKey
): Promise<TransactionInstruction> {
  if (!program.provider.publicKey) {
    throw new Error("no public key found on the program provider");
  }
  return program.methods.updateEmperor(newAuthority).accounts({}).instruction();
}
