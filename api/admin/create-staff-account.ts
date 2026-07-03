import { json, normalizeUsername, readJsonBody } from "../_lib/authServer.js";
import { requireAdminProfile } from "../_lib/adminAuth.js";
import { isTrustedOrigin } from "../_lib/requestSecurity.js";
import { supabaseServerClient } from "../_lib/supabaseServerClient.js";

export const config = { runtime: "edge" };

type StaffRole = "moderator" | "admin";
const STAFF_ROLES = new Set<StaffRole>(["moderator", "admin"]);

interface CreateStaffAccountBody {
  username?: unknown;
  password?: unknown;
  role?: unknown;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);
  if (!isTrustedOrigin(request)) return json({ error: "forbidden_origin" }, 403);

  try {
    return await handleCreateStaffAccount(request);
  } catch (error) {
    console.error("[admin.create-staff-account] unhandled error", error);
    return json({ error: "internal_error" }, 500);
  }
}

async function handleCreateStaffAccount(request: Request): Promise<Response> {
  const admin = await requireAdminProfile(request);
  if (!admin) return json({ error: "unauthorized" }, 401);

  const body = await readJsonBody<CreateStaffAccountBody>(request);
  if (!body) return json({ error: "invalid_json" }, 400);

  const username = typeof body.username === "string" ? normalizeUsername(body.username) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = typeof body.role === "string" ? body.role : "";

  if (!username) return json({ error: "username_required" }, 400);
  if (password.length < 6) return json({ error: "password_too_short" }, 400);
  if (!STAFF_ROLES.has(role as StaffRole)) return json({ error: "Invalid input.", details: "role" }, 400);

  const { data, error } = await supabaseServerClient.rpc("create_user_with_password", {
    p_username: username,
    p_password: password,
  });
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("username_taken") || error.code === "23505") {
      return json({ error: "username_taken" }, 409);
    }
    return json({ error: "failed_to_create_account" }, 400);
  }
  const userId = typeof data === "string" ? data : null;
  if (!userId) return json({ error: "failed_to_create_account" }, 500);

  const { error: roleError } = await supabaseServerClient.from("users").update({ role }).eq("id", userId);
  if (roleError) return json({ error: "Account created but failed to set role." }, 500);

  return json({ ok: true, userId, username, role });
}
