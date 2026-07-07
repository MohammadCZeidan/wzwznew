import { supabase } from '../client';

export interface WaitlistSummary {
  counts: Record<string, number>;
  joinedCommunityIds: Set<string>;
}

type DbWaitlistRow = {
  community_id: string;
  user_id: string;
};

type WaitlistSummaryRow = {
  community_id: string;
  waitlist_count: number | string | null;
  joined: boolean | null;
};

function mapWaitlistSummaryRows(rows: WaitlistSummaryRow[]): WaitlistSummary {
  const counts: Record<string, number> = {};
  const joinedCommunityIds = new Set<string>();

  for (const row of rows) {
    counts[row.community_id] = Number(row.waitlist_count ?? 0);
    if (row.joined) {
      joinedCommunityIds.add(row.community_id);
    }
  }

  return { counts, joinedCommunityIds };
}

async function fetchWaitlistSummaryFallback(userId: string): Promise<WaitlistSummary> {
  const { data, error } = await supabase
    .from('community_waitlist')
    .select('community_id, user_id');

  if (error) throw error;

  const counts: Record<string, number> = {};
  const joinedCommunityIds = new Set<string>();
  for (const row of (data ?? []) as DbWaitlistRow[]) {
    counts[row.community_id] = (counts[row.community_id] ?? 0) + 1;
    if (row.user_id === userId) {
      joinedCommunityIds.add(row.community_id);
    }
  }

  return { counts, joinedCommunityIds };
}

function isMissingRpcError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: string; message?: string; status?: number };
  return candidate.code === 'PGRST202' || candidate.status === 404 || candidate.message?.includes('get_waitlist_summary') === true;
}

export async function fetchWaitlistSummary(userId: string): Promise<WaitlistSummary> {
  const { data, error } = await supabase.rpc('get_waitlist_summary', {
    p_user_id: userId,
  });

  if (!error) {
    return mapWaitlistSummaryRows((data ?? []) as WaitlistSummaryRow[]);
  }

  if (isMissingRpcError(error)) {
    return fetchWaitlistSummaryFallback(userId);
  }

  throw error;
}

export async function joinCommunityWaitlist(
  communityId: string,
  _userId: string,
  _username: string,
): Promise<number> {
  void _userId;
  void _username;
  const { data, error } = await supabase.rpc('join_community_waitlist', {
    p_community_id: communityId,
  });

  if (error) throw error;
  return typeof data === 'number' ? data : Number(data ?? 0);
}
