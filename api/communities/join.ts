import { json, readJsonBody } from "../_lib/authServer.js";
import { isTrustedOrigin } from "../_lib/requestSecurity.js";
import { supabaseServerClient } from "../_lib/supabaseServerClient.js";
import { fetchSessionProfile, getRequestUserId, isCurrentlyBanned } from "../_lib/sessionAuth.js";

export const config = { runtime: "edge" };

interface JoinBody {
  communityId?: unknown;
}

// Server-authoritative counterpart to communityController.joinCommunity().
// The browser client cannot reliably reach an RLS/current_user_id()-gated
// RPC (see docs/architecture-review.md A2 — the forged Supabase session
// never attaches to supabase-js's rpc()/from() calls in SDK 2.x, since
// _getAccessToken() reads from the GoTrue session, not the patched
// headers object). This mirrors api/chat/send.ts: identity comes from the
// verified `raw_session` cookie, and the write uses the service-role
// client directly instead of a SECURITY DEFINER RPC.
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);
  if (!isTrustedOrigin(request)) return json({ error: "forbidden_origin" }, 403);

  try {
    return await handleJoin(request);
  } catch (error) {
    console.error("[communities.join] unhandled error", error);
    return json({ error: "internal_error" }, 500);
  }
}

async function handleJoin(request: Request): Promise<Response> {
  // Narrowing from handler's guard doesn't cross function boundaries.
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);

  const userId = await getRequestUserId(request);
  if (!userId) return json({ error: "unauthorized" }, 401);

  const body = await readJsonBody<JoinBody>(request);
  const communityId = typeof body?.communityId === "string" ? body.communityId : "";
  if (!communityId) return json({ error: "Invalid input.", details: "communityId" }, 400);

  const profile = await fetchSessionProfile(userId);
  if (!profile) return json({ error: "User not found." }, 401);
  if (profile.status === "deleted" || isCurrentlyBanned(profile)) {
    return json({ error: "account_inactive" }, 403);
  }

  const { error: upsertError } = await supabaseServerClient
    .from("community_members")
    .upsert(
      { community_id: communityId, user_id: userId, username: profile.username },
      { onConflict: "community_id,user_id", ignoreDuplicates: false },
    );

  if (upsertError) {
    console.error("[communities.join] upsert error", upsertError);
    return json({ error: "Failed to join community." }, 500);
  }

  return json({ ok: true });
}
