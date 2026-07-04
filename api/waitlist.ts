// Landing-page waitlist capture. Validates the payload, moderates nothing
// (structured lead fields), and persists to public.landing_waitlist via the
// service-role client. Public POST, gated by trusted-origin + per-IP rate limit.
import { isTrustedOrigin } from "./_lib/requestSecurity.js";
import { supabaseServerClient } from "./_lib/supabaseServerClient.js";
import { checkRateLimit, clientIp, rateLimitErrorResponse } from "./_lib/rateLimit.js";

export const config = { runtime: "edge" };

type Role = "owner" | "provider" | "user";

interface WaitlistPayload {
  email: string;
  role: Role;
  owner_name?: string;
  community_name?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

function isRole(value: unknown): value is Role {
  return value === "owner" || value === "provider" || value === "user";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clean(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);
  if (!supabaseServerClient) return jsonResponse({ error: "supabase_not_configured" }, 503);
  if (!isTrustedOrigin(request)) return jsonResponse({ error: "forbidden_origin" }, 403);

  const rate = await checkRateLimit("anon_question", clientIp(request));
  if (!rate.ok) return rateLimitErrorResponse(rate);

  let payload: WaitlistPayload;
  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const email = typeof payload?.email === "string" ? payload.email.trim().slice(0, 320) : "";
  if (!email || !isValidEmail(email) || !isRole(payload.role)) {
    return jsonResponse({ error: "invalid_payload" }, 400);
  }

  const { error } = await supabaseServerClient.from("landing_waitlist").insert({
    email,
    role: payload.role,
    owner_name: clean(payload.owner_name, 120),
    community_name: clean(payload.community_name, 120),
    source: clean(payload.source, 80),
    utm_source: clean(payload.utm_source, 120),
    utm_medium: clean(payload.utm_medium, 120),
    utm_campaign: clean(payload.utm_campaign, 120),
  });
  if (error) {
    console.error("[waitlist] insert error", error);
    return jsonResponse({ error: "failed_to_join_waitlist" }, 500);
  }

  return jsonResponse({ ok: true }, 201);
}
