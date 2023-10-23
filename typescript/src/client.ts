import {
  BN,
  parseIdlErrors,
  Program,
  translateError,
  type ProgramAccount,
  type Provider,
} from "@coral-xyz/anchor";
import { IDL, type Nexdraw } from "./nexdraw";
import { Metaplex } from "@metaplex-foundation/js/dist/types/Metaplex";
import { PROGRAM_ID } from "./addresses";
import { Connection } from "@solana/web3.js";
import { buildAnonymousProvider } from "./utils";

const idlErrors = parseIdlErrors(IDL);

export type ClientOptions = {
  gatewayReplacements?: Record<string, string>;
};

export class NexDraw {
  #mpl: Metaplex;
  #program: Program<Nexdraw>;
  #provider: Provider;
  #gatewayReplacements: Record<string, string>;

  /**
   * Creates an instance of nexdraw.
   * @param {Provider} provider
   * @param {ClientOptions} [options]
   * @memberof NexDraw
   */

  constructor(provider: Provider, options?: ClientOptions) {
    if (!provider.publicKey) {
      throw new Error("no public key found on the argued provider");
    } else if (!provider.sendAndConfirm) {
      throw new Error(
        "no sendAndConfirm function found on the argued provider"
      );
    }

    const defaultReplacements = {
      "ar://": "https://arweave.net/",
      "ipfs://": "https://nftstorage.link/ipfs/",
    };

    this.#mpl = Metaplex.make(provider.connection);
    this.#program = new Program(IDL, PROGRAM_ID, provider);
    this.#provider = provider;
    this.#gatewayReplacements = {
      ...defaultReplacements,
      ...(options?.gatewayReplacements ?? {}),
    };
  }

  /**
   * Create an instance of the client without a full provider.
   * @static
   * @param {Connection} connection
   * @param {ClientOptions} [options]
   * @returns {NexDraw}
   * @memberof NexDraw
   */
  static anonymous(connection: Connection, options?: ClientOptions): NexDraw {
    return new NexDraw(buildAnonymousProvider(connection), options);
  }
}
