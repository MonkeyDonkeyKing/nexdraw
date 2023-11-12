import { parseIdlErrors, Program, translateError, type ProgramAccount, type Provider, BN } from '@coral-xyz/anchor';
import { IDL, type Nexdraw } from './nexdraw';
import { Metaplex, type JsonMetadata, type Metadata } from '@metaplex-foundation/js';
import { PROGRAM_ID, deriveDrawRegent, deriveTicketMint } from './addresses';
import { Connection, PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { buildAnonymousProvider } from './utils';
import {
  createAddNftPrizeTransaction,
  createAddPoolPrizeTransaction,
  createBuyTicketTransaction,
  createCreateDrawRegentTransaction,
  createCreateTimedSolDrawTransaction,
  createInitializeEmperorTransaction,
  createStartDrawTransaction,
  createUpdateDrawRegentTransaction,
  createUpdateEmperorAuthorityTransaction
} from './instructions';
import { IdlTimedParams, startDrawParams } from './types';

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

  get drawRegent(): [PublicKey, number] {
    if (!this.#provider.publicKey) {
      throw new Error('no public key found on the program provider');
    }
    return deriveDrawRegent(this.#provider.publicKey);
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
   * @param new_regent
   * @param draws_remaining
   * @param commission
   * @returns {Promise<string>}
   * @memberof NexDraw
   *
   */
  async createDrawRegent(new_regent: PublicKey, draws_remaining: number, commission: number): Promise<string> {
    const tx = await createCreateDrawRegentTransaction(this.#program, new_regent, draws_remaining, commission);
    return this._withParsedTransactionError(tx);
  }

  /**
   * updates a draw regent account
   * @param {PublicKey} draw_regent
   * @param {number|null} [draws_remaining=null]
   * @param {number|null} [new_emperor_commission=null]
   * @returns {Promise<string>}
   * @memberof NexDraw
   *
   */
  async updateDrawRegent(
    draw_regent: PublicKey,
    draws_remaining: number | null = null,
    new_emperor_commission: number | null = null
  ): Promise<string> {
    const tx = await createUpdateDrawRegentTransaction(
      this.#program,
      draw_regent,
      draws_remaining,
      new_emperor_commission
    );
    return this._withParsedTransactionError(tx);
  }

  /**
   * creates a new draw
   * @param {BN} ticketPrice
   * @param {IdlTimedParams} timedParams
   * @returns {Promise<string>}
   * @memberof NexDraw
   *
   */
  async createDraw(ticketPrice: BN, timedParams: IdlTimedParams): Promise<string> {
    const tx = await createCreateTimedSolDrawTransaction(this.#program, ticketPrice, timedParams);
    return this._withParsedTransactionError(tx);
  }

  /**
   * Adds an nft prize to a draw
   * @param {PublicKey} draw
   * @param {PublicKey} nft
   * @returns {Promise<string>}
   * @memberof NexDraw
   *
   */
  async addNftPrizeToDraw(draw: PublicKey, nft: PublicKey): Promise<string> {
    const tx = await createAddNftPrizeTransaction(this.#program, draw, nft);
    return this._withParsedTransactionError(tx);
  }

  /**
   * Adds an pool prize to a draw
   * @param {PublicKey} draw
   * @param {PublicKey} percentage
   * @returns {Promise<string>}
   * @memberof NexDraw
   *
   */
  async addPoolPrizeToDraw(draw: PublicKey, percentage: number): Promise<string> {
    const tx = await createAddPoolPrizeTransaction(this.#program, draw, percentage);
    return this._withParsedTransactionError(tx);
  }

  /**
   * Starts a draw
   * @param {PublicKey} draw
   * @param {startDrawParams} nftParams
   * @returns {Promise<string>}
   * @memberof NexDraw
   *
   */
  async startDraw(draw: PublicKey, nftParams: startDrawParams): Promise<string> {
    const tx = await createStartDrawTransaction(this.#program, draw, nftParams);
    return this._withParsedTransactionError(tx);
  }

  /**
   * Buys a ticket
   * @param {PublicKey} draw
   * @returns {Promise<string>}
   * @memberof NexDraw
   *
   */
  async buyTicket(draw: PublicKey): Promise<string> {
    const sold: number = (await this.#program.account.draw.fetch(draw)).ticketInfo.sold;
    let max = sold * 2 > 100 ? sold * 2 : 100;
    let ticketId = 0;
    while (true) {
      // generate a random number between 0 and max
      const randomNumber = Math.floor(Math.random() * max);
      const ticket = deriveTicketMint(draw, ticketId)[0];
      const accountData = await this.#program.provider.connection.getParsedAccountInfo(ticket);
      if (accountData.value === null) {
        ticketId = randomNumber;
        break;
      }
    }
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000
    });
    const tx = (await createBuyTicketTransaction(this.#program, draw, ticketId)).add(modifyComputeUnits);
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
