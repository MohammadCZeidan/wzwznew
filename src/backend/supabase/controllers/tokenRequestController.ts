import { supabase } from '../client';

export interface TokenRequestInput {
  userId: string;
  username: string;
  tokens: number;
  priceUsd: number;
  note?: string;
}

/**
 * Submit a token top-up request. Columns match the admin dashboard
 * (welkhazen/merginggggg) `token_requests` schema. The admin reviews pending
 * rows and sets status = 'approved', which credits the user's balance via the
 * grant_tokens_on_approval trigger.
 */
export async function submitTokenRequest(input: TokenRequestInput): Promise<void> {
  if (!input.userId) throw new Error("Sign in to request tokens.");

  const { error } = await supabase.from('token_requests').insert({
    user_id: input.userId,
    username: input.username,
    tokens: input.tokens,
    price_usd: input.priceUsd,
    reasons: [],
    note: input.note ?? null,
  });

  if (error) throw error;
}
