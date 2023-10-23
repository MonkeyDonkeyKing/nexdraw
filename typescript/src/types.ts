import { BN, Program, type IdlAccounts, type IdlTypes } from '@coral-xyz/anchor';
import type { JsonMetadata, Metadata } from '@metaplex-foundation/js';
import { PublicKey } from '@solana/web3.js';
import { IDL, type Nexdraw } from './nexdraw';

// ================
// IDL TYPE HELPERS
// ================
export type Methods<T extends keyof Program<Nexdraw>['methods']> = T;
export type AccountParams<T extends keyof Program<Nexdraw>['methods']> = Parameters<
  ReturnType<Program<Nexdraw>['methods'][T]>['accounts']
>[number];
export type a = Methods<'createDrawRegent'>;

export type MethodParams<T extends keyof Program<Nexdraw>['methods']> = Parameters<
  Program<Nexdraw>['methods'][T]
>[number];
// ================
// IDL PARSED TYPES
// ================
export type EmperorAccount = IdlAccounts<Nexdraw>['emperor'];
export type DrawRegentAccount = IdlAccounts<Nexdraw>['drawRegent'];

// export type IdlCreateXnftParameters = IdlTypes<Nexdraw>[""];

// =================
// ABSTRACTION TYPES
// =================
/**
    export const KindOptions = IDL.types[4].type.variants.map((v) => v.name);
    console.assert(IDL.types[4].type.variants.map((v) => v.name).includes("App"));

    export const TagOptions = IDL.types[5].type.variants.map((v) => v.name);
    console.assert(IDL.types[5].type.variants.map((v) => v.name).includes("Defi"));
*/
