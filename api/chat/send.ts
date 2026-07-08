import { json, readJsonBody } from "../_lib/authServer.js";
import { isTrustedOrigin } from "../_lib/requestSecurity.js";
import { supabaseServerClient } from "../_lib/supabaseServerClient.js";
import { getRequestUserId } from "../_lib/sessionAuth.js";
import { listBlockedWords } from "../_lib/blockedWordsStore.js";
import { listBannedWords, type BannedWordRecord } from "../_lib/bannedWordsStore.js";
import { checkServerText, findDenylistedTerms, parseEnvDenylist } from "../_lib/serverModeration.js";

export const config = { runtime: "edge" };

// Repeated link/phone-number attempts (spam) auto-ban the user after this many strikes.
const SPAM_STRIKE_BAN_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Admin check
// ---------------------------------------------------------------------------

function isAdminUsername(username: string): boolean {
  const raw = process.env.ADMIN_USERNAMES ?? "";
  if (!raw) return false;
  const set = new Set(raw.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean));
  return set.has(username.toLowerCase());
}

// ---------------------------------------------------------------------------
// Banned-words auto-moderation
// ---------------------------------------------------------------------------

// Record a moderation_flags row per matched banned word so the admin "Flagged
// content" panel shows who wrote what. Best-effort: a failure here must never
// break sending, so errors are logged and swallowed.
async function recordModerationFlags(
  supabase: NonNullable<typeof supabaseServerClient>,
  args: { communityId: string; senderId: string; messageId: string | null; text: string; matches: BannedWordRecord[] },
): Promise<void> {
  for (const match of args.matches) {
    const { error } = await supabase.from("moderation_flags").insert({
      message_id: args.messageId,
      community_id: args.communityId,
      sender_id: args.senderId,
      matched_word: match.normalizedWord,
      reason: args.text,
    });
    if (error) console.error("[chat.send] moderation flag insert error", error);
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

interface SendBody {
  communityId?: unknown;
  text?: unknown;
  identityAlias?: unknown;
  avatarLevel?: unknown;
  replyToMessageId?: unknown;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);
  if (!isTrustedOrigin(request)) return json({ error: "forbidden_origin" }, 403);

  try {
    return await handleSend(request);
  } catch (error) {
    console.error("[chat.send] unhandled error", error);
    return json({ error: "internal_error" }, 500);
  }
}

async function handleSend(request: Request): Promise<Response> {
  // Narrowing from handler's guard doesn't cross function boundaries.
  if (!supabaseServerClient) return json({ error: "supabase_not_configured" }, 503);

  const userId = await getRequestUserId(request);
  if (!userId) return json({ error: "unauthorized" }, 401);

  const body = await readJsonBody<SendBody>(request);
  if (!body) return json({ error: "invalid_json" }, 400);

  const { communityId, text, identityAlias, avatarLevel, replyToMessageId } = body;

  if (typeof communityId !== "string" || communityId.length === 0 || communityId.length > 100)
    return json({ error: "Invalid input.", details: "communityId" }, 400);
  // "invalid_text_length" matches the send_community_message RPC's error code
  // (supabase/migrations/20260630000000_harden_chat_blocked_words.sql) so the
  // frontend's getChatSendErrorInfo() classifies it the same way either path.
  if (typeof text !== "string" || text.trim().length === 0 || text.length > 2000)
    return json({ error: "invalid_text_length" }, 400);
  if (identityAlias !== undefined && identityAlias !== null && (typeof identityAlias !== "string" || identityAlias.length > 50))
    return json({ error: "Invalid input.", details: "identityAlias" }, 400);
  if (avatarLevel !== undefined && avatarLevel !== null && (typeof avatarLevel !== "number" || !Number.isInteger(avatarLevel) || avatarLevel < 1 || avatarLevel > 100))
    return json({ error: "Invalid input.", details: "avatarLevel" }, 400);
  if (replyToMessageId !== undefined && replyToMessageId !== null && (typeof replyToMessageId !== "string" || !/^[0-9a-f-]{36}$/.test(replyToMessageId)))
    return json({ error: "Invalid input.", details: "replyToMessageId" }, 400);

  const trimmedText = text.trim();

  let { data: user, error: userError } = await supabaseServerClient
    .from("users")
    .select("id, username, avatar_level, status, spam_strikes, banned_until")
    .eq("id", userId)
    .single();

  // spam_strikes/banned_until may not exist yet if that migration hasn't
  // landed on this database — fall back to the guaranteed column set rather
  // than failing every chat send.
  if (userError) {
    ({ data: user, error: userError } = await supabaseServerClient
      .from("users")
      .select("id, username, avatar_level, status")
      .eq("id", userId)
      .single());
  }

  if (userError || !user) return json({ error: "unauthorized" }, 401);

  const userRow = user as {
    id: string;
    username: string;
    avatar_level?: number;
    status: string;
    spam_strikes?: number;
    banned_until?: string | null;
  };
  if (userRow.status === "deleted") return json({ error: "not_allowed" }, 403);
  if (userRow.status === "banned") {
    const timeoutExpired = userRow.banned_until && new Date(userRow.banned_until).getTime() <= Date.now();
    if (!timeoutExpired) return json({ error: "not_allowed" }, 403);
    // Timeout has passed — lazily clear it so the user can post again.
    await supabaseServerClient.from("users").update({ status: "active", banned_until: null }).eq("id", userId);
    userRow.status = "active";
  }

  // Enforce blocked words + link/number rules server-side before any DB write.
  const [dbBlockedWords, bannedWords] = await Promise.all([
    listBlockedWords(supabaseServerClient),
    listBannedWords(supabaseServerClient),
  ]);
  const blockedTerms = [
    ...parseEnvDenylist(process.env.VITE_RAW_TEXT_DENYLIST),
    ...dbBlockedWords.map((w) => w.normalizedTerm),
  ];
  const moderation = checkServerText(trimmedText, blockedTerms);
  if (!moderation.allowed) {
    let banned = false;

    if (moderation.violation === "link" || moderation.violation === "number") {
      const strikes = (userRow.spam_strikes ?? 0) + 1;
      banned = strikes >= SPAM_STRIKE_BAN_THRESHOLD;

      await supabaseServerClient
        .from("users")
        .update(banned ? { spam_strikes: strikes, status: "banned" } : { spam_strikes: strikes })
        .eq("id", userId);

      if (banned) {
        await supabaseServerClient.from("chat_reports").insert({
          community_id: communityId,
          reported_user_id: userId,
          reported_username: userRow.username,
          reason: `auto_ban_spam_${moderation.violation}`,
          details: `Auto-banned after ${strikes} link/phone-number spam attempts in chat.`,
          status: "banned",
          resolved_at: new Date().toISOString(),
          resolved_by: "bot",
        });
      }
    }

    return json({ error: banned ? "banned_for_spam" : "blocked_word", violation: moderation.violation }, banned ? 403 : 422);
  }

  // Per-word auto-moderation: match the text against the banned-words list.
  // 'block' words reject the send outright; 'flag'/'shadow' words let it through
  // but get recorded for admin review after the message is stored.
  const matchedTerms = new Set(findDenylistedTerms(trimmedText, bannedWords.map((w) => w.normalizedWord)));
  const bannedMatches = bannedWords.filter((w) => matchedTerms.has(w.normalizedWord));
  const blockMatches = bannedMatches.filter((w) => w.action === "block");
  if (blockMatches.length > 0) {
    await recordModerationFlags(supabaseServerClient, {
      communityId,
      senderId: userId,
      messageId: null,
      text: trimmedText,
      matches: blockMatches,
    });
    return json({ error: "blocked_word", violation: "banned" }, 422);
  }

  const { data: member } = await supabaseServerClient
    .from("community_members")
    .select("user_id")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!member && !isAdminUsername(userRow.username)) {
    return json({ error: "not_a_member" }, 403);
  }

  let senderName: string = userRow.username;
  let senderAvatarLevel: number = userRow.avatar_level ?? 1;

  if (identityAlias) {
    const { data: alias } = await supabaseServerClient
      .from("user_aliases")
      .select("alias")
      .eq("user_id", userId)
      .eq("is_public", false)
      .ilike("alias", identityAlias as string)
      .maybeSingle();
    if (!alias) return json({ error: "Invalid identity alias." }, 403);
    senderName = (alias as { alias: string }).alias;
  }

  if (typeof avatarLevel === "number" && avatarLevel >= 1 && avatarLevel <= 100) {
    senderAvatarLevel = avatarLevel;
  }

  let replyToSenderName: string | null = null;
  let replyToText: string | null = null;

  if (replyToMessageId) {
    const { data: original } = await supabaseServerClient
      .from("community_messages")
      .select("sender_name, text")
      .eq("id", replyToMessageId as string)
      .eq("community_id", communityId)
      .maybeSingle();
    if (original) {
      replyToSenderName = (original as { sender_name: string }).sender_name;
      replyToText = (original as { text: string }).text;
    }
  }

  const { data: message, error: insertError } = await supabaseServerClient
    .from("community_messages")
    .insert({
      community_id: communityId,
      sender_id: userId,
      sender_name: senderName,
      sender_avatar_level: senderAvatarLevel,
      text: trimmedText,
      reply_to_message_id: replyToMessageId ?? null,
      reply_to_sender_name: replyToSenderName,
      reply_to_text: replyToText,
    })
    .select("*")
    .single();

  if (insertError || !message) {
    console.error("[chat.send] insert error", insertError);
    return json({ error: "Failed to send message." }, 500);
  }

  const row = message as Record<string, unknown>;

  // Record flag/shadow matches now that the message exists (message_id links the
  // flag to the stored message). ponytail: 'shadow' currently records a flag but
  // still shows the message to everyone; true shadow-hiding is a follow-up.
  if (bannedMatches.length > 0) {
    await recordModerationFlags(supabaseServerClient, {
      communityId,
      senderId: userId,
      messageId: typeof row.id === "string" ? row.id : null,
      text: trimmedText,
      matches: bannedMatches,
    });
  }

  return json({
    ok: true,
    message: {
      id: row.id,
      communityId: row.community_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      text: row.text,
      createdAt: row.created_at,
      replyToMessageId: row.reply_to_message_id ?? undefined,
      replyToSenderName: row.reply_to_sender_name ?? undefined,
      replyToText: row.reply_to_text ?? undefined,
      deletedAt: row.deleted_at ?? undefined,
      deletedByUserId: row.deleted_by_user_id ?? undefined,
      likedBy: (row.liked_by as string[]) ?? [],
      senderAvatarLevel: row.sender_avatar_level ?? undefined,
    },
  });
}
