import { createClient } from "@supabase/supabase-js";
import { supabaseServerClient } from "../../_lib/supabaseServerClient.js";
import { isTrustedOrigin } from "../../_lib/requestSecurity.js";
import { getRequestUserId, mintAccessToken, verifyAccessToken } from "../../_lib/sessionAuth.js";
import { checkRateLimit, rateLimitErrorResponse } from "../../_lib/rateLimit.js";

export const config = { runtime: "edge" };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function getRouteUserId(request: Request): string | null {
  const pathname = new URL(request.url).pathname;
  const match = pathname.match(/^\/api\/users\/([^/]+)\/tokens$/);
  return match ? decodeURIComponent(match[1]) : null;
}

type ChallengeReset = "daily" | "weekly" | "monthly";

const CHALLENGE_REWARDS: Record<string, { xp: number; tokens: number; reset: ChallengeReset }> = {
  "daily-7-polls": { xp: 50, tokens: 50, reset: "daily" },
  "weekly-warrior": { xp: 150, tokens: 150, reset: "weekly" },
  "monthly-70-polls": { xp: 500, tokens: 500, reset: "monthly" },
  "seven-day-streak": { xp: 100, tokens: 120, reset: "weekly" },
  "thirty-day-streak": { xp: 300, tokens: 320, reset: "monthly" },
};

function getTodayKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function getWeekKey(): string {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = start.getUTCDay() || 7;
  start.setUTCDate(start.getUTCDate() - day + 1);
  return `${start.getUTCFullYear()}-W${String(Math.ceil((((start.getTime() - Date.UTC(start.getUTCFullYear(), 0, 1)) / 86400000) + 1) / 7)).padStart(2, "0")}`;
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getResetKey(reset: ChallengeReset): string {
  if (reset === "weekly") return getWeekKey();
  if (reset === "monthly") return getMonthKey();
  return getTodayKey();
}

function resolveChallengeReward(claimKey: string): { xp: number; tokens: number } | null {
  const separator = claimKey.indexOf(":");
  if (separator <= 0) return null;
  const challengeId = claimKey.slice(0, separator);
  const reward = CHALLENGE_REWARDS[challengeId];
  if (!reward) return null;
  if (claimKey !== `${challengeId}:${getResetKey(reward.reset)}`) return null;
  return { xp: reward.xp, tokens: reward.tokens };
}

async function readBody(request: Request): Promise<{
  action?: unknown;
  amount?: unknown;
  source?: unknown;
  claimKey?: unknown;
  xpAmount?: unknown;
  tokenAmount?: unknown;
} | null> {
  try {
    return (await request.json()) as {
      action?: unknown;
      amount?: unknown;
      source?: unknown;
      claimKey?: unknown;
      xpAmount?: unknown;
      tokenAmount?: unknown;
    };
  } catch {
    return null;
  }
}

async function getVerifiedUserId(request: Request): Promise<string | null> {
  const cookieUserId = await getRequestUserId(request);
  if (cookieUserId) return cookieUserId;
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return verifyAccessToken(match[1]);
}

// Build a Supabase client scoped to the user's JWT so PostgREST sees
// auth.uid() inside SECURITY DEFINER RPCs (e.g. spend_tokens).
function buildUserScopedClient(accessToken: string) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const supabaseAnonKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);

  const routeUserId = getRouteUserId(request);
  if (!routeUserId) return json({ error: "missing_user_id" }, 400);
  if (!isTrustedOrigin(request)) return json({ error: "forbidden_origin" }, 403);

  const verifiedUserId = await getVerifiedUserId(request);
  if (!verifiedUserId) return json({ error: "unauthorized" }, 401);
  if (verifiedUserId !== routeUserId) return json({ error: "forbidden_user" }, 403);

  // Per-user throttle on writes only: 20 spend attempts / minute. GET path
  // (balance read) is cheap and unmetered.
  if (request.method === "POST") {
    const rate = await checkRateLimit("token_spend", verifiedUserId);
    if (!rate.ok) return rateLimitErrorResponse(rate);
  }

  if (request.method === "GET") {
    const { data, error } = await supabaseServerClient
      .from("users")
      .select("token_balance")
      .eq("id", verifiedUserId)
      .single();
    if (error || !data) return json({ error: "failed_to_fetch_token_balance" }, 404);
    return json({ balance: (data as { token_balance: number }).token_balance });
  }

  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const body = await readBody(request);
  if (!body) return json({ error: "invalid_json" }, 400);

  if (body.action === "claim_challenge_reward") {
    const source = typeof body.source === "string" ? body.source.trim() : "";
    const claimKey = typeof body.claimKey === "string" ? body.claimKey.trim() : "";
    if (!source || !claimKey) return json({ error: "invalid_claim" }, 400);
    if (source !== "challenge") return json({ error: "invalid_claim_source" }, 400);
    const reward = resolveChallengeReward(claimKey);
    if (!reward) return json({ error: "invalid_challenge_reward" }, 400);

    const accessToken = await mintAccessToken(verifiedUserId);
    if (!accessToken) return json({ error: "session_not_configured" }, 500);
    const client = buildUserScopedClient(accessToken);
    if (!client) return json({ error: "supabase_not_configured" }, 503);

    const { data, error } = await client.rpc("claim_challenge_reward", {
      p_source: source,
      p_claim_key: claimKey,
      p_xp_amount: reward.xp,
      p_token_amount: reward.tokens,
    });
    if (error) return json({ error: "failed_to_claim_challenge_reward" }, 500);

    const payload = (data as {
      awarded?: boolean;
      xp?: number;
      level?: number;
      leveled_up?: boolean;
      token_balance?: number;
      error?: string;
    }) ?? {};
    if (payload.error) {
      const status = payload.error === "unauthorized" ? 401 : 400;
      return json({ error: payload.error }, status);
    }

    return json({
      awarded: payload.awarded === true,
      xp: payload.xp ?? 0,
      level: payload.level ?? 1,
      leveledUp: payload.leveled_up === true,
      tokenBalance: payload.token_balance ?? 0,
    });
  }

  // Minting tokens from the client is never allowed; only the trusted
  // server-side reward flows may credit balances.
  if (body.action === "add") {
    return json({ error: "token_minting_requires_trusted_server" }, 403);
  }

  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount <= 0) {
    return json({ error: "invalid_token_amount" }, 400);
  }

  // Atomic spend via the hardened RPC. Forward a freshly-minted JWT for the
  // verified user so spend_tokens()'s current_user_id() resolves correctly.
  const accessToken = await mintAccessToken(verifiedUserId);
  if (!accessToken) return json({ error: "session_not_configured" }, 500);
  const client = buildUserScopedClient(accessToken);
  if (!client) return json({ error: "supabase_not_configured" }, 503);

  const { data, error } = await client.rpc("spend_tokens", { p_amount: amount });
  if (error) return json({ error: "failed_to_spend_tokens" }, 500);

  const payload = (data as { ok?: boolean; error?: string; balance?: number }) ?? {};
  if (payload.ok === false) {
    const status = payload.error === "insufficient_balance" ? 400 : 403;
    return json({ error: payload.error ?? "spend_rejected" }, status);
  }

  return json({ balance: payload.balance ?? 0 });
}
