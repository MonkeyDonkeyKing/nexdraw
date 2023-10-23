import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Nexdraw } from "../target/types/nexdraw";

let emperor: anchor.web3.PublicKey;

describe("It can't be hiyacked", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Nexdraw as Program<Nexdraw>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initializeEmperor().rpc();
    console.log("Your transaction signature", tx);
  });
});
