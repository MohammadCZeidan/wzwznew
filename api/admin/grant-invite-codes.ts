import { json, readJsonBody } from "../_lib/authServer.js";
import { requireAdminProfile } from "../_lib/adminAuth.js";
import { isTrustedOrigin } from "../_lib/requestSecurity.js";
import { supabaseServerClient } from "../_lib/supabaseServerClient.js";

export const config = { runtime: "edge" };

const MAX_GRANT_PER_REQUEST = 20;

interface GrantInviteCodesBody {
  username?: unknown;
  count?: unknown;
}

function createInviteCode(slot: number): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const randomPart = Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 8)
    .toUpperCase();
  return `RAW-${slot}-${randomPart}`;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);
  if (!isTrustedOrigin(request)) return json({ error: "forbidden_origin" }, 403);

  try {
    return await handleGrant(request);
  } catch (error) {
    console.error("[admin.grant-invite-codes] unhandled error", error);
    return json({ error: "internal_error" }, 500);
  }
}

async function handleGrant(request: Request): Promise<Response> {
  const admin = await requireAdminProfile(request);
  if (!admin) return json({ error: "unauthorized" }, 401);

  const body = await readJsonBody<GrantInviteCodesBody>(request);
  if (!body) return json({ error: "invalid_json" }, 400);

  const { username, count } = body;
  if (typeof username !== "string" || username.trim().length === 0)
    return json({ error: "Invalid input.", details: "username" }, 400);
  if (typeof count !== "number" || !Number.isInteger(count) || count < 1 || count > MAX_GRANT_PER_REQUEST)
    return json({ error: "Invalid input.", details: "count" }, 400);

  const { data: target, error: targetError } = await supabaseServerClient
    .from("users")
    .select("id, username")
    .ilike("username", username.trim())
    .single();
  if (targetError || !target) return json({ error: "user_not_found" }, 404);

  const targetRow = target as { id: string; username: string };

  const { count: existingCount } = await supabaseServerClient
    .from("founding_invites")
    .select("code", { count: "exact", head: true })
    .eq("inviter_id", targetRow.id);

  const startSlot = (existingCount ?? 0) + 1;
  const newCodes = Array.from({ length: count }, (_, i) => createInviteCode(startSlot + i));

  const { error: insertError } = await supabaseServerClient
    .from("founding_invites")
    .insert(newCodes.map((code) => ({ code, inviter_id: targetRow.id })));
  if (insertError) return json({ error: "Failed to grant invite codes." }, 500);

  return json({ ok: true, codes: newCodes });
}
