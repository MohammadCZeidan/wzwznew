async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "grant_invite_codes_request_failed");
  }
  return body;
}

export async function grantInviteCodes(username: string, count: number): Promise<string[]> {
  const body = await parseJsonResponse<{ codes: string[] }>(
    await fetch("/api/admin/grant-invite-codes", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, count }),
    }),
  );
  return body.codes;
}
