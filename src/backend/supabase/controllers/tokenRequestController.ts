import { supabase } from '../client';

export interface TokenRequestInput {
  userId: string;
  username: string;
  tokens: number;
  priceUsd: number;
  note?: string;
}

function isBadRequest(error: { code?: string; status?: number } | null): boolean {
  return error?.status === 400 || error?.code === "PGRST204" || error?.code === "42703";
}

export async function submitTokenRequest(input: TokenRequestInput): Promise<void> {
  if (!input.userId) throw new Error("Sign in to request tokens.");

  const packageReason = `${input.tokens} tokens`;
  const combinedNote = input.note?.trim()
    ? `${packageReason} requested. ${input.note.trim()}`
    : `${packageReason} requested.`;

  const primaryInsert = await supabase.from('token_requests').insert({
    user_id: input.userId,
    username: input.username,
    price_usd: input.priceUsd,
    reasons: [packageReason],
    note: combinedNote,
  });

  if (!primaryInsert.error) return;

  // `token_requests` is defined in the shared admin repo, and some deployed
  // environments still expose older column sets.
  if (!isBadRequest(primaryInsert.error)) {
    throw new Error(primaryInsert.error.message || "Failed to request tokens.");
  }

  const legacyInsert = await supabase.from('token_requests').insert({
    user_id: input.userId,
    username: input.username,
    tokens: input.tokens,
    price: input.priceUsd,
  });

  if (legacyInsert.error) {
    throw new Error(legacyInsert.error.message || primaryInsert.error.message || "Failed to request tokens.");
  }
}
