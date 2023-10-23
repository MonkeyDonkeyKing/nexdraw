import { BN, type IdlAccounts, type IdlTypes } from "@coral-xyz/anchor";
import type { JsonMetadata, Metadata } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import { IDL, type Nexdraw } from "./nexdraw";

// =================
// ABSTRACTION TYPES
// =================
export const KindOptions = IDL.types[4].type.variants.map((v) => v.name);
console.assert(IDL.types[4].type.variants.map((v) => v.name).includes("App"));

export const TagOptions = IDL.types[5].type.variants.map((v) => v.name);
console.assert(IDL.types[5].type.variants.map((v) => v.name).includes("Defi"));
