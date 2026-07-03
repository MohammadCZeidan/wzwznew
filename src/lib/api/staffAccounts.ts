export type StaffRole = "moderator" | "admin";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "create_staff_account_request_failed");
  }
  return body;
}

export async function createStaffAccount(username: string, password: string, role: StaffRole): Promise<void> {
  await parseJsonResponse<{ ok: true }>(
    await fetch("/api/admin/create-staff-account", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    }),
  );
}
