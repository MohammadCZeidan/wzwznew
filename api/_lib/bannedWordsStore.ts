import type { SupabaseClient } from "@supabase/supabase-js";

// Banned words drive the per-word auto-moderation filter surfaced in the admin
// "Flagged content" panel. Unlike blocked_words (a hard denylist), each banned
// word carries an action: 'block' rejects the send, 'flag'/'shadow' let it
// through but record a moderation_flags row for admin review.

export type BannedWordAction = "block" | "flag" | "shadow";

export type BannedWordRecord = {
  normalizedWord: string;
  action: BannedWordAction;
};

function normalizeAction(value: unknown): BannedWordAction {
  const action = typeof value === "string" ? value.toLowerCase() : "";
  return action === "block" || action === "shadow" ? action : "flag";
}

export async function listBannedWords(supabase: SupabaseClient): Promise<BannedWordRecord[]> {
  const { data, error } = await supabase.from("banned_words").select("normalized_word, action");
  // Best-effort: auto-moderation must never break chat sending. If the table is
  // missing or unreadable, behave as if there are no banned words.
  if (error) return [];
  return ((data ?? []) as Array<{ normalized_word: string | null; action: string | null }>)
    .map((row) => ({ normalizedWord: (row.normalized_word ?? "").toLowerCase(), action: normalizeAction(row.action) }))
    .filter((row) => row.normalizedWord.length > 0);
}
