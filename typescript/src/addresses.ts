import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "DRAWDnBHxRrointnFhaLEsexAXjgW2rUqZU7qpGqxonP"
);

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

/**
 * The constant PDA for the Emperor program account.
 * @export
 * @type {[PublicKey, number]}
 */
export const EMPEROR_ADDRESS: [PublicKey, number] =
  PublicKey.findProgramAddressSync([Buffer.from("emperor")], PROGRAM_ID);

/**
 * Derive the PDA for an Access program account.
 * @export
 * @param {PublicKey} wallet
 * @param {PublicKey} xnft
 * @returns {[PublicKey, number]}
 */
export function derive(
  wallet: PublicKey,
  xnft: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("access"), wallet.toBytes(), xnft.toBytes()],
    PROGRAM_ID
  );
}

/**
 * Derive the PDA for an Access program account.
 * @export
 * @param {PublicKey} wallet
 * @param {PublicKey} xnft
 * @returns {[PublicKey, number]}
 */
export function deriveLotteryAddress(
  wallet: PublicKey,
  xnft: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("access"), wallet.toBytes(), xnft.toBytes()],
    PROGRAM_ID
  );
}
