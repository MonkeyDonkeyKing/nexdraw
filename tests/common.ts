import * as anchor from '@coral-xyz/anchor';
import type { Nexdraw } from '../target/types/nexdraw';
import { ClientOptions, NexDraw } from '../typescript/src';
import { PROGRAM_ID } from '../typescript/src/addresses';
import { Keypair } from '@solana/web3.js';

const program = anchor.workspace.Nexdraw as anchor.Program<Nexdraw>;

export function createRandomProvider(confirmOptions?: anchor.web3.ConfirmOptions): anchor.AnchorProvider {
  const randomWallet = new anchor.Wallet(Keypair.generate());
  return new anchor.AnchorProvider(program.provider.connection, randomWallet, confirmOptions ?? {});
}

export function createRandomNexDraw(
  confirmOptions?: anchor.web3.ConfirmOptions,
  ClientOptions?: ClientOptions
): NexDraw {
  const randomProvider = createRandomProvider(confirmOptions);
  return new NexDraw(randomProvider, ClientOptions ?? {});
}

export const client = new NexDraw(program.provider);

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const metadataProgram = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
