import { validateApiKey, checkRateLimit } from "@/lib/api-keys";

export async function validateApiRequest(
  request: Request
): Promise<{ valid: boolean; orgId?: string; keyId?: string; scopes?: string[]; error?: string }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }

  const token = authHeader.slice(7);

  if (!token.startsWith("lk_live_")) {
    return { valid: false, error: "Invalid API key format" };
  }

  const result = await validateApiKey(token);

  if (!result.valid) {
    return result;
  }

  // Check rate limit
  const rateCheck = checkRateLimit(result.keyId!);
  if (!rateCheck.allowed) {
    return { valid: false, error: "Rate limit exceeded" };
  }

  return result;
}
