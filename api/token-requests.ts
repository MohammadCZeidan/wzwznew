import { json, readJsonBody } from "./_lib/authServer.js";
import { isTrustedOrigin } from "./_lib/requestSecurity.js";
import { supabaseServerClient } from "./_lib/supabaseServerClient.js";
import { fetchSessionProfile, getRequestUserId, isCurrentlyBanned } from "./_lib/sessionAuth.js";

export const config = { runtime: "edge" };

interface TokenRequestBody {
  tokens?: unknown;
  priceUsd?: unknown;
  note?: unknown;
}

function isBadRequest(error: { code?: string; status?: number } | null): boolean {
  return error?.status === 400 || error?.code === "PGRST204" || error?.code === "42703";
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);
  if (!isTrustedOrigin(request)) return json({ error: "forbidden_origin" }, 403);

  const userId = await getRequestUserId(request);
  if (!userId) return json({ error: "unauthorized" }, 401);

  const profile = await fetchSessionProfile(userId);
  if (!profile) return json({ error: "user_not_found" }, 401);
  if (profile.status === "deleted" || isCurrentlyBanned(profile)) {
    return json({ error: "account_inactive" }, 403);
  }

  const body = await readJsonBody<TokenRequestBody>(request);
  if (!body) return json({ error: "invalid_json" }, 400);

  const tokens = Number(body.tokens);
  const priceUsd = Number(body.priceUsd);
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (!Number.isInteger(tokens) || tokens <= 0) return json({ error: "invalid_tokens" }, 400);
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) return json({ error: "invalid_price" }, 400);

  const packageReason = `${tokens} tokens`;
  const combinedNote = note ? `${packageReason} requested. ${note}` : `${packageReason} requested.`;

  const primaryInsert = await supabaseServerClient.from("token_requests").insert({
    user_id: userId,
    username: profile.username,
    price_usd: priceUsd,
    reasons: [packageReason],
    note: combinedNote,
    status: "pending",
  });
  if (!primaryInsert.error) return json({ ok: true }, 201);

  if (!isBadRequest(primaryInsert.error)) {
    console.error("[token-requests] primary insert error", primaryInsert.error);
    return json({ error: primaryInsert.error.message || "failed_to_create_token_request" }, 500);
  }

  const legacyInsert = await supabaseServerClient.from("token_requests").insert({
    user_id: userId,
    username: profile.username,
    tokens,
    price: priceUsd,
  });
  if (!legacyInsert.error) return json({ ok: true }, 201);

  console.error("[token-requests] legacy insert error", legacyInsert.error);
  return json(
    { error: legacyInsert.error.message || primaryInsert.error.message || "failed_to_create_token_request" },
    500,
  );
}
