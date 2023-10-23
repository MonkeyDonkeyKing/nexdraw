import * as anchor from "@coral-xyz/anchor";
import type { Nexdraw } from "../target/types/nexdraw";
import { NexDraw } from "../typescript/src";
import { PROGRAM_ID } from "../typescript/src/addresses";

export const program = anchor.workspace.Nexdraw as anchor.Program<Nexdraw>;

export const client = new NexDraw(program.provider);

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const metadataProgram = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
