import { BN, Provider } from '@coral-xyz/anchor';
import { ClientOptions, NexDraw } from '../typescript/src';
import { PublicKey, Transaction } from '@solana/web3.js';
import { wait } from './common';

export class NexDrawBuilder {
  private _provider?: Provider;
  private _options?: ClientOptions;
  private _initialFunding?: number;
  private _initializeAsDrawRegent?: { regentKey: PublicKey; drawsRemaining: number; commission: number };
  private _mainClient: NexDraw; // The main client with permissions to initialize as a drawRegent

  constructor(mainClient: NexDraw) {
    this._mainClient = mainClient;
  }

  withProvider(provider: Provider): NexDrawBuilder {
    this._provider = provider;
    return this;
  }

  withOptions(options: ClientOptions): NexDrawBuilder {
    this._options = options;
    return this;
  }

  withInitialFunding(lamports: number): NexDrawBuilder {
    this._initialFunding = lamports;
    return this;
  }

  initializeAsDrawRegent(drawsRemaining: number, commission: number): NexDrawBuilder {
    let regentKey = this._provider.publicKey;
    this._initializeAsDrawRegent = { regentKey, drawsRemaining, commission };
    return this;
  }

  async build(): Promise<NexDraw> {
    if (!this._provider) {
      throw new Error('Provider must be set before building a NexDraw instance.');
    }

    const nexDraw = new NexDraw(this._provider, this._options);

    if (this._initialFunding) {
      await this.fundNexDraw(nexDraw, this._initialFunding);
    }

    if (this._initializeAsDrawRegent) {
      await this._mainClient.createDrawRegent(
        this._initializeAsDrawRegent.regentKey,
        this._initializeAsDrawRegent.drawsRemaining,
        this._initializeAsDrawRegent.commission
      );
    }

    await wait(1000);

    return nexDraw;
  }

  private async fundNexDraw(nexDraw: NexDraw, lamports: number): Promise<void> {
    await nexDraw.provider.connection.requestAirdrop(nexDraw.provider.publicKey, lamports);
  }
}
