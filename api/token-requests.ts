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

function isConstraintError(error: { code?: string; message?: string | null } | null, constraint: string): boolean {
  return error?.code === "23514" && (error.message ?? "").includes(constraint);
}

// Derive the requested token count for display: prefer the tokens column, else
// parse "<n> tokens" out of the reasons/note text the request was created with.
function tokenCountFor(row: { tokens: number | null; reasons: string[] | null; note: string | null }): number | null {
  if (typeof row.tokens === "number" && row.tokens > 0) return row.tokens;
  const text = [...(row.reasons ?? []), row.note ?? ""].join(" ");
  const match = text.match(/\b(\d+)\s+tokens?\b/i);
  const amount = match ? Number(match[1]) : NaN;
  return Number.isInteger(amount) && amount > 0 ? amount : null;
}

// Reviewed outcomes the user should be notified about. 'fulfilled'/'approved'
// = granted, 'rejected' = declined. (Live rows use 'fulfilled'.)
async function handleList(request: Request): Promise<Response> {
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);
  const userId = await getRequestUserId(request);
  if (!userId) return json({ error: "unauthorized" }, 401);

  const { data, error } = await supabaseServerClient
    .from("token_requests")
    .select("id, tokens, price_usd, reasons, note, status, created_at")
    .eq("user_id", userId)
    .in("status", ["fulfilled", "approved", "rejected"])
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[token-requests] list error", error);
    return json({ error: "failed_to_load_token_requests" }, 500);
  }

  const rows = (data ?? []) as Array<{
    id: string; tokens: number | null; price_usd: number | null;
    reasons: string[] | null; note: string | null; status: string; created_at: string;
  }>;

  return json({
    tokenRequests: rows.map((row) => ({
      id: row.id,
      tokens: tokenCountFor(row),
      priceUsd: row.price_usd,
      status: row.status === "fulfilled" ? "approved" : row.status,
      createdAt: row.created_at,
    })),
  }, 200);
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "GET") return handleList(request);
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

  const insertRow = {
    user_id: userId,
    username: profile.username,
    price_usd: priceUsd,
    reasons: [packageReason],
    note: combinedNote,
  };

  let primaryInsert = await supabaseServerClient.from("token_requests").insert({
    ...insertRow,
    status: "pending",
  });

  // Production is currently between schema versions: some databases still
  // enforce the older status check and only allow the default row status.
  if (isConstraintError(primaryInsert.error, "token_requests_status_check")) {
    primaryInsert = await supabaseServerClient.from("token_requests").insert(insertRow);
  }
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
