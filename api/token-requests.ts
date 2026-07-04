// Authenticated dashboard action: a user asks for a token top-up (real payments
// aren't live yet). Records which dollar package they want and why, for an admin
// to follow up. Identity comes from the raw_session cookie, not the body.
import { json, readJsonBody } from "./_lib/authServer.js";
import { isTrustedOrigin } from "./_lib/requestSecurity.js";
import { supabaseServerClient } from "./_lib/supabaseServerClient.js";
import { fetchSessionProfile, getRequestUserId } from "./_lib/sessionAuth.js";
import { checkRateLimit, rateLimitErrorResponse } from "./_lib/rateLimit.js";

export const config = { runtime: "edge" };

// Kept in sync with REQUEST_PACKAGES / REQUEST_REASONS in the client modal.
const ALLOWED_PRICES = new Set([5, 10, 20, 50, 100]);
const ALLOWED_REASONS = new Set([
  "Buying an avatar",
  "Unlocking more polls",
  "Asking my own question",
  "Creating a community",
  "Unlocking a theme colour",
  "Spinning the wheel",
  "Something else",
]);

type TokenRequestBody = { priceUsd?: unknown; reasons?: unknown; note?: unknown };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);
  if (!isTrustedOrigin(request)) return json({ error: "forbidden_origin" }, 403);

  const userId = await getRequestUserId(request);
  if (!userId) return json({ error: "unauthorized" }, 401);

  const rate = await checkRateLimit("token_request", userId);
  if (!rate.ok) return rateLimitErrorResponse(rate);

  const body = await readJsonBody<TokenRequestBody>(request);
  const priceUsd = typeof body?.priceUsd === "number" ? body.priceUsd : NaN;
  if (!ALLOWED_PRICES.has(priceUsd)) return json({ error: "invalid_package" }, 400);

  const reasons = Array.isArray(body?.reasons)
    ? [...new Set(body!.reasons.filter((r): r is string => typeof r === "string" && ALLOWED_REASONS.has(r)))]
    : [];
  if (reasons.length === 0) return json({ error: "reason_required" }, 400);

  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : null;

  const profile = await fetchSessionProfile(userId);
  const { error } = await supabaseServerClient.from("token_requests").insert({
    user_id: userId,
    username: profile?.username ?? null,
    price_usd: priceUsd,
    reasons,
    note: note || null,
  });
  if (error) {
    console.error("[token-requests] insert error", error);
    return json({ error: "failed_to_submit_request" }, 500);
  }

  return json({ ok: true }, 201);
}
