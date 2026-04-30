// @ts-nocheck
import { db } from "@launchkit/database";
import { customDomains } from "@launchkit/database";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import dns from "dns/promises";

/**
 * Resolve the organization ID from a custom domain hostname.
 */
export async function resolveOrgFromDomain(hostname: string) {
  const [domain] = await db
    .select()
    .from(customDomains)
    .where(eq(customDomains.domain, hostname))
    .limit(1);

  if (!domain || domain.status !== "active") {
    return null;
  }

  return domain.orgId;
}

/**
 * Generate a random verification token for DNS TXT record.
 */
export function generateVerificationToken(): string {
  return `launchkit-verify=${randomBytes(32).toString("hex")}`;
}

/**
 * Verify a domain by checking its DNS TXT records for the expected verification token.
 */
export async function verifyDomain(
  domain: string,
  token: string
): Promise<boolean> {
  try {
    const records = await dns.resolveTxt(domain);
    // records is an array of arrays of strings
    const flatRecords = records.flat();
    return flatRecords.some((record) => record === token);
  } catch {
    // DNS lookup failed — domain not verified
    return false;
  }
}
