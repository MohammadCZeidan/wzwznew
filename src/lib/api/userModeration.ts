export type ModerationAction = "warn" | "timeout" | "ban" | "unban";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string; details?: string };
  if (!response.ok) {
    throw new Error(body.details ? `${body.error}: ${body.details}` : body.error ?? "moderate_user_request_failed");
  }
  return body;
}

export async function moderateUser(
  username: string,
  action: ModerationAction,
  minutes?: number,
): Promise<void> {
  await parseJsonResponse<{ ok: true }>(
    await fetch("/api/admin/moderate-user", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, action, minutes }),
    }),
  );
}
