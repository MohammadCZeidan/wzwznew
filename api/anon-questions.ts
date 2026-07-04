// Public landing endpoint: accepts an anonymous question from the "Your Voice"
// section, moderates it server-side, and stores it for later review. No auth —
// gated by trusted-origin + a per-IP rate limit, same as other public POSTs.
import { json, readJsonBody } from "./_lib/authServer.js";
import { isTrustedOrigin } from "./_lib/requestSecurity.js";
import { supabaseServerClient } from "./_lib/supabaseServerClient.js";
import { checkRateLimit, clientIp, rateLimitErrorResponse } from "./_lib/rateLimit.js";
import { listBlockedTermsCached } from "./_lib/blockedWordsStore.js";
import { checkServerText, parseEnvDenylist } from "./_lib/serverModeration.js";

export const config = { runtime: "edge" };

const MAX_QUESTION_LENGTH = 300;

type AnonQuestionBody = { question?: unknown };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);
  if (!isTrustedOrigin(request)) return json({ error: "forbidden_origin" }, 403);

  const rate = await checkRateLimit("anon_question", clientIp(request));
  if (!rate.ok) return rateLimitErrorResponse(rate);

  const body = await readJsonBody<AnonQuestionBody>(request);
  const question = typeof body?.question === "string" ? body.question.trim().slice(0, MAX_QUESTION_LENGTH) : "";
  if (!question) return json({ error: "invalid_question" }, 400);

  // Server-authoritative moderation — the client check is UX-only.
  const blockedTerms = [
    ...parseEnvDenylist(process.env.VITE_RAW_TEXT_DENYLIST),
    ...(await listBlockedTermsCached(supabaseServerClient)),
  ];
  const moderation = checkServerText(question, blockedTerms);
  if (!moderation.allowed) return json({ error: "blocked_word", violation: moderation.violation }, 422);

  const referer = request.headers.get("referer");
  const { error } = await supabaseServerClient.from("anon_questions").insert({
    question,
    page_url: referer ? referer.slice(0, 500) : null,
    user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
  });
  if (error) {
    console.error("[anon-questions] insert error", error);
    return json({ error: "failed_to_submit_question" }, 500);
  }

  return json({ ok: true }, 201);
}
