import { AnchorProvider, Program, Provider } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { type Nexdraw, IDL } from "./nexdraw";
import { PROGRAM_ID } from "./addresses";

export function buildAnonymousProvider(connection: Connection): Provider {
  return new AnchorProvider(
    connection,
    /* eslint @typescript-eslint/ban-ts-comment: 0 */
    // @ts-ignore
    { publicKey: PublicKey.default },
    {}
  );
}

export function buildAnonymousProgram(
  connection: Connection
): Program<Nexdraw> {
  const provider = new AnchorProvider(
    connection,
    /* eslint @typescript-eslint/ban-ts-comment: 0 */
    // @ts-ignore
    { publicKey: PublicKey.default },
    {}
  );
  return new Program(IDL, PROGRAM_ID, provider);
}

export function enumsEqual<T extends string>(
  variant: { [t in T]?: unknown },
  other: T
): boolean {
  return Object.keys(variant)[0] === other;
}

export function gatewayUri(
  replacements: Record<string, string>,
  uri: string
): string {
  let sanitized = uri;
  for (const [find, replace] of Object.entries(replacements)) {
    sanitized = sanitized.replace(find, replace);
  }
  return sanitized;
}
