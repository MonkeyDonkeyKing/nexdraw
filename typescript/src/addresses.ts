import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey('DRAWDnBHxRrointnFhaLEsexAXjgW2rUqZU7qpGqxonP');

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

/**
 * The constant PDA for the Emperor program account.
 * @export
 * @type {[PublicKey, number]}
 */
export const EMPEROR_ADDRESS: [PublicKey, number] = PublicKey.findProgramAddressSync(
  [Buffer.from('emperor')],
  PROGRAM_ID
);

/**
 * Derive the PDA for an DrawRegent program account.
 * @export
 * @param {PublicKey} drawManager
 * @returns {[PublicKey, number]}
 */
export function deriveDrawRegent(drawManager: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('draw_regent'), drawManager.toBytes()], PROGRAM_ID);
}

export function deriveDraw(drawRegent: PublicKey, drawId: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('draw'), drawRegent.toBytes(), new BN(drawId).toArrayLike(Buffer, 'le', 4)],
    PROGRAM_ID
  );
}

//// Metaplex Pdas
export function deriveMetadata(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );
}

export function deriveMasterEdition(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')],
    TOKEN_METADATA_PROGRAM_ID
  );
}
