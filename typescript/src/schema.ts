import { z, ZodLiteral, ZodUnion } from "zod";
import { PublicKey } from "@solana/web3.js";
import semver from "semver";

export const PublicKeySchema = z.string().refine(
  (val) => {
    try {
      new PublicKey(val);
      return true;
    } catch {
      return false;
    }
  },
  {
    message: "Invalid public key",
  }
);

export const EmperorSchema = z.object({
  authority: PublicKeySchema,
});
export type EmperorType = z.infer<typeof EmperorSchema>;
