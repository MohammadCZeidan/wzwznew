export interface TokenRequestInput {
  userId: string;
  username: string;
  tokens: number;
  priceUsd: number;
  note?: string;
}

export interface TokenRequestOutcome {
  id: string;
  tokens: number | null;
  priceUsd: number | null;
  status: "approved" | "rejected" | string;
  createdAt: string;
}

/** Current user's reviewed token requests (approved/rejected), for notifications. */
export async function listMyTokenRequestOutcomes(): Promise<TokenRequestOutcome[]> {
  const response = await fetch("/api/token-requests", {
    method: "GET",
    credentials: "same-origin",
  });
  if (!response.ok) return [];
  const payload = (await response.json().catch(() => null)) as { tokenRequests?: TokenRequestOutcome[] } | null;
  return payload?.tokenRequests ?? [];
}

export async function submitTokenRequest(input: TokenRequestInput): Promise<void> {
  if (!input.userId) throw new Error("Sign in to request tokens.");
  const response = await fetch("/api/token-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      tokens: input.tokens,
      priceUsd: input.priceUsd,
      note: input.note ?? "",
    }),
  });
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) throw new Error(payload?.error || "Failed to request tokens.");
}
