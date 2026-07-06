import { json, readJsonBody } from "../_lib/authServer.js";
import { isTrustedOrigin } from "../_lib/requestSecurity.js";
import { supabaseServerClient } from "../_lib/supabaseServerClient.js";
import { getRequestUserId } from "../_lib/sessionAuth.js";

export const config = { runtime: "edge" };

interface LeaveBody {
  communityId?: unknown;
}

// Server-authoritative counterpart to communityController.leaveCommunity().
// See api/communities/join.ts for why this can't be a browser-side
// current_user_id()-gated RPC call.
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);
  if (!isTrustedOrigin(request)) return json({ error: "forbidden_origin" }, 403);

  const userId = await getRequestUserId(request);
  if (!userId) return json({ error: "unauthorized" }, 401);

  const body = await readJsonBody<LeaveBody>(request);
  const communityId = typeof body?.communityId === "string" ? body.communityId : "";
  if (!communityId) return json({ error: "Invalid input.", details: "communityId" }, 400);

  const { error: deleteError } = await supabaseServerClient
    .from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", userId);

  if (deleteError) {
    console.error("[communities.leave] delete error", deleteError);
    return json({ error: "Failed to leave community." }, 500);
  }

  return json({ ok: true });
}
