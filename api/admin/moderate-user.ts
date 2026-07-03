import { json, readJsonBody } from "../_lib/authServer.js";
import { requireModeratorProfile } from "../_lib/adminAuth.js";
import { isTrustedOrigin } from "../_lib/requestSecurity.js";
import { supabaseServerClient } from "../_lib/supabaseServerClient.js";

export const config = { runtime: "edge" };

type ModerationAction = "warn" | "timeout" | "ban" | "unban";
const ACTIONS = new Set<ModerationAction>(["warn", "timeout", "ban", "unban"]);
const MAX_TIMEOUT_MINUTES = 60 * 24 * 30; // 30 days

interface ModerateUserBody {
  userId?: unknown;
  username?: unknown;
  action?: unknown;
  minutes?: unknown;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);
  if (!isTrustedOrigin(request)) return json({ error: "forbidden_origin" }, 403);

  const moderator = await requireModeratorProfile(request);
  if (!moderator) return json({ error: "unauthorized" }, 401);

  const body = await readJsonBody<ModerateUserBody>(request);
  if (!body) return json({ error: "invalid_json" }, 400);

  const { userId, username, action, minutes } = body;
  const hasUserId = typeof userId === "string" && userId.length > 0;
  const hasUsername = typeof username === "string" && username.trim().length > 0;
  if (!hasUserId && !hasUsername) return json({ error: "Invalid input.", details: "userId" }, 400);
  if (typeof action !== "string" || !ACTIONS.has(action as ModerationAction))
    return json({ error: "Invalid input.", details: "action" }, 400);
  if (action === "timeout" && (typeof minutes !== "number" || !Number.isInteger(minutes) || minutes < 1 || minutes > MAX_TIMEOUT_MINUTES))
    return json({ error: "Invalid input.", details: "minutes" }, 400);

  const lookup = supabaseServerClient.from("users").select("id, username, role, warnings");
  const { data: target, error: targetError } = await (
    hasUserId ? lookup.eq("id", userId as string) : lookup.ilike("username", (username as string).trim())
  ).single();
  if (targetError || !target) return json({ error: "user_not_found" }, 404);

  const targetRow = target as { id: string; username: string; role: string; warnings?: number };
  if (targetRow.role === "admin" || targetRow.role === "moderator") return json({ error: "cannot_moderate_staff" }, 403);
  const targetUserId = targetRow.id;

  const patch: Record<string, unknown> = {};
  let reportStatus: "warned" | "banned" = "warned";
  let reportReason = `moderator_${action}`;
  let details = "";

  if (action === "warn") {
    patch.warnings = (targetRow.warnings ?? 0) + 1;
  } else if (action === "timeout") {
    const until = new Date(Date.now() + (minutes as number) * 60_000);
    patch.status = "banned";
    patch.banned_until = until.toISOString();
    reportStatus = "banned";
    details = `Timed out for ${minutes} minute(s), until ${until.toISOString()}.`;
  } else if (action === "ban") {
    patch.status = "banned";
    patch.banned_until = null;
    reportStatus = "banned";
    details = "Permanently banned.";
  } else {
    patch.status = "active";
    patch.banned_until = null;
    patch.spam_strikes = 0;
    reportReason = "moderator_unban";
    details = "Unbanned.";
  }

  const { error: updateError } = await supabaseServerClient.from("users").update(patch).eq("id", targetUserId);
  if (updateError) return json({ error: "Failed to update user." }, 500);

  if (action !== "unban") {
    await supabaseServerClient.from("chat_reports").insert({
      reported_user_id: targetUserId,
      reported_username: targetRow.username,
      reason: reportReason,
      details,
      status: reportStatus,
      resolved_at: new Date().toISOString(),
      resolved_by: moderator.username,
    });
  }

  return json({ ok: true });
}
