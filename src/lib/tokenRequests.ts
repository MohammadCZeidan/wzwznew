import { apiRequest } from "@/lib/api/client";

// Dollar tiers and reasons the "Request Tokens" modal offers. Kept in sync with
// ALLOWED_PRICES / ALLOWED_REASONS in api/token-requests.ts.
export const REQUEST_PACKAGES = [5, 10, 20, 50, 100] as const;

export const REQUEST_REASONS = [
  "Buying an avatar",
  "Unlocking more polls",
  "Asking my own question",
  "Creating a community",
  "Unlocking a theme colour",
  "Spinning the wheel",
  "Something else",
] as const;

export type RequestReason = (typeof REQUEST_REASONS)[number];

export async function submitTokenRequest(input: {
  priceUsd: number;
  reasons: RequestReason[];
  note?: string;
}): Promise<void> {
  await apiRequest("/api/token-requests", {
    method: "POST",
    body: JSON.stringify({
      priceUsd: input.priceUsd,
      reasons: input.reasons,
      note: input.note?.trim() || undefined,
    }),
  });
}
