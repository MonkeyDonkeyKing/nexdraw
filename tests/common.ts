import * as anchor from "@coral-xyz/anchor";
import type { Nexdraw } from "../target/types/nexdraw";

const program = anchor.workspace.Xnft as anchor.Program<Nexdraw>;

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const metadataProgram = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
