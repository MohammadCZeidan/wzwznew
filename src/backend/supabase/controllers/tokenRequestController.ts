import { supabase } from '../client';

export interface TokenRequestInput {
  userId: string;
  username: string;
  tokens: number;
  price: number;
}

/**
 * Submit a token top-up request. The admin dashboard reads pending rows from
 * `token_requests` and calls `approve_token_request` to grant the tokens.
 */
export async function submitTokenRequest(input: TokenRequestInput): Promise<void> {
  if (!input.userId) throw new Error("Sign in to request tokens.");

  const { error } = await supabase.from('token_requests').insert({
    user_id: input.userId,
    username: input.username,
    tokens: input.tokens,
    price: input.price,
  });

  if (error) throw error;
}
