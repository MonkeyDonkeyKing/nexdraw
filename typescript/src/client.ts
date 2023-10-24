import { parseIdlErrors, Program, translateError, type ProgramAccount, type Provider } from '@coral-xyz/anchor';
import { IDL, type Nexdraw } from './nexdraw';
import { Metaplex, type JsonMetadata, type Metadata } from '@metaplex-foundation/js';
import { PROGRAM_ID } from './addresses';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { buildAnonymousProvider } from './utils';
import {
  createCreateDrawRegentTransaction,
  createInitializeEmperorTransaction,
  createUpdateDrawRegentTransaction,
  createUpdateEmperorAuthorityTransaction
} from './instructions';

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
      throw new Error('no public key found on the argued provider');
    } else if (!provider.sendAndConfirm) {
      throw new Error('no sendAndConfirm function found on the argued provider');
    }

    const defaultReplacements = {
      'ar://': 'https://arweave.net/',
      'ipfs://': 'https://nftstorage.link/ipfs/'
    };

    this.#mpl = Metaplex.make(provider.connection);
    this.#program = new Program(IDL, PROGRAM_ID, provider);
    this.#provider = provider;
    this.#gatewayReplacements = {
      ...defaultReplacements,
      ...(options?.gatewayReplacements ?? {})
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

  /**
   * Readonly accessor for the internal Metaplex SDK instance.
   * @readonly
   * @type {Metaplex}
   * @memberof NexDraw
   */
  get metaplex(): Metaplex {
    return this.#mpl;
  }

  /**
   * Readonly access for the internal program instance.
   * @readonly
   * @type {Program<Nexdraw>}
   * @memberof NexDraw
   */
  get program(): Program<Nexdraw> {
    return this.#program;
  }

  /**
   * Readonly accessor for the internal provider instance.
   * @readonly
   * @type {Provider}
   * @memberof NexDraw
   */
  get provider(): Provider {
    return this.#provider;
  }

  /**
   * initializes the emperor account
   * @returns {Promise<string>}
   * @memberof NexDraw
   */
  async createEmperor(): Promise<string> {
    const tx = await createInitializeEmperorTransaction(this.#program);
    return this._withParsedTransactionError(tx);
  }

  /**
   * updates the emperor account
   * @param newAuthority
   * @returns {Promise<string>}
   * @memberof NexDraw
   *
   */
  async updateEmperor(newAuthority: PublicKey): Promise<string> {
    const tx = await createUpdateEmperorAuthorityTransaction(this.#program, newAuthority);
    return this._withParsedTransactionError(tx);
  }

  /**
   * creates a draw regent account
   * @param regent_key
   * @param draws_remaining
   * @param commission
   * @returns {Promise<string>}
   * @memberof NexDraw
   *
   */
  async createDrawRegent(regent_key: PublicKey, draws_remaining: number, commission: number): Promise<string> {
    const tx = await createCreateDrawRegentTransaction(this.#program, regent_key, draws_remaining, commission);
    return this._withParsedTransactionError(tx);
  }

  /**
   * updates a draw regent account
   * @param {number|null} [draws_remaining=null]
   * @param {number|null} [new_emperor_commission=null]
   * @returns {Promise<string>}
   * @memberof NexDraw
   *
   */
  async updateDrawRegent(
    draws_remaining: number | null = null,
    new_emperor_commission: number | null = null
  ): Promise<string> {
    const tx = await createUpdateDrawRegentTransaction(this.#program, draws_remaining, new_emperor_commission);
    return this._withParsedTransactionError(tx);
  }

  private async _withParsedTransactionError(tx: Transaction): Promise<string> {
    try {
      return await this.#provider.sendAndConfirm!(tx);
    } catch (err) {
      throw translateError(err, idlErrors);
    }
  }
}
