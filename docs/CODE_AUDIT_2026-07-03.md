# Full Code Audit — raW (frontend + backend)

_Date: 2026-07-03 · Scope: `api/` (Vercel edge functions), `server/` (Express service),
`supabase/` (schema, RLS, RPCs), `src/` (React frontend), `middleware.ts`, `vercel.json`._

This is a read-only review. No application code was changed. Findings are ranked by
severity; each includes the concrete failure scenario and a suggested fix. A "What's
solid" section at the end records the security controls that are working, so a fix pass
doesn't undo them.

---

## Summary

| # | Severity | Area | Finding |
|---|----------|------|---------|
| 1 | High | DB / auth | Password hashing uses bcrypt **cost factor 6** everywhere |
| 2 | Medium | DB / auth | Timed-out users are **permanently locked out of login** |
| 3 | Medium | DB / build | `submit_poll_vote` RPC has **no migration** in the repo |
| 4 | Medium | Frontend / infra | `AskAI` calls `/api/assistant/*`, which has **no Vercel function** |
| 5 | Low | Infra | `vercel.json` CORS `Access-Control-Allow-Origin` points at the **non-canonical** host |
| 6 | Low | Edge | `middleware.ts` reflects the `invite` query param into HTML **unescaped** |
| 7 | Low | DB | `delete-account` cleanup is a **non-transactional** sequence of deletes |
| 8 | Low | Frontend | `apiRequest` lets caller `headers` **clobber** the merged `Content-Type` |
| 9 | Info | Auth design | Minted `authenticated` JWT (7-day) is stored in **localStorage** |
| 10 | Info | Architecture | Two parallel auth backends (`api/` vs `server/`); `server/` ignores ban state |

---

## 1. Password hashing uses bcrypt cost factor 6 — High

**Where:** every `create_user_with_password` / `update_user_password` variant, e.g.
`supabase/migrations/20260605145730_case_insensitive_usernames.sql:15`
(`extensions.gen_salt('bf', 6)`), and the older RPCs that call `gen_salt('bf')` with no
cost argument (pgcrypto's default is also **6**): `20240004000000_custom_auth_rpcs.sql`,
`20260601074611_account_password_rpcs.sql:28`, `schema.sql:386`, etc.

**Why it matters:** bcrypt cost 6 = 2⁶ = 64 key-expansion rounds. OWASP's floor is 10, and
12 is the common default (the repo's own Express path uses `BCRYPT_ROUNDS` default **12** —
`server/config/env.ts`). If the `users` table ever leaks, cost-6 hashes fall to offline
GPU cracking orders of magnitude faster than cost-12. Since this app's entire identity model
is username + password (no email/2FA), the password hash is the whole vault.

**Failure scenario:** DB backup or `password_hash` column exfiltration → attacker cracks a
large fraction of passwords cheaply → account takeover at scale.

**Fix:** bump to `gen_salt('bf', 12)` in a new `create_user_with_password` /
`update_user_password` migration. Existing hashes stay valid (bcrypt self-describes its
cost); optionally re-hash on next successful login when the stored cost is < 12.

---

## 2. Timed-out users are permanently locked out of login — Medium

**Where:** `verify_user_password` (`.../20260605145730_case_insensitive_usernames.sql`)
filters `status not in ('banned','deleted')`. Timeouts are modelled as
`status='banned'` + `banned_until` in the future
(`api/admin/moderate-user.ts`, `supabase/migrations/20260703010000_moderator_role_and_timeouts.sql`).

**Why it matters:** the "timeout auto-expires" behaviour only exists in the *lazy-clear*
code that runs on **already-authenticated** paths — `fetchSessionProfile`
(`api/_lib/sessionAuth.ts`), `api/auth/me.ts`, `api/chat/send.ts`. The **login** path calls
`verify_user_password`, which returns `NULL` for any `status='banned'` row regardless of
`banned_until`. Nothing clears an expired timeout for a logged-out user.

**Failure scenario:** a moderator issues a 14-day timeout (allowed up to 30 days). The
`raw_session` cookie is 7 days. Once it expires — or the user simply logs out — they can no
longer log in even after the 14 days pass; `verify_user_password` keeps returning
`invalid_credentials`. Only a manual `unban` restores access. What was meant to be a
temporary sanction becomes a permanent lockout.

**Fix:** teach `verify_user_password` to treat an expired timeout as active — either
`status <> 'deleted' AND NOT (status='banned' AND (banned_until IS NULL OR banned_until > now()))`,
or clear the flag in a `SECURITY DEFINER` step before the credential check. Keep permanent
bans (`banned_until IS NULL`) rejected.

---

## 3. `submit_poll_vote` RPC has no migration in the repo — Medium

**Where:** `api/polls/[pollId]/vote.ts` calls `client.rpc("submit_poll_vote", …)`.
`CHANGELOG.md:41` and `docs/SECURITY_NOTES.md:39` describe it (SECURITY DEFINER, one vote
per user via a unique partial index), but no `.sql` file in `supabase/migrations`,
`schema.sql`, or `full_schema_deploy.sql` defines it. `grep -r submit_poll_vote --include=*.sql`
returns nothing.

**Why it matters:** the schema is not reproducible. On a fresh database built purely from
this repo, the vote endpoint hits a missing function and returns
`failed_to_record_vote` (500). The unique-index dedup the changelog promises also isn't in
version control, so single-vote enforcement can't be verified or recreated.

**Failure scenario:** a new/staging Supabase project provisioned from migrations → poll
voting is broken and there's no record of the dedup index.

**Fix:** commit the migration that creates `submit_poll_vote` and its
`unique (user_id, poll_id)` index. If it only exists live in prod, dump it
(`pg_get_functiondef`) and add it as a dated migration.

---

## 4. `AskAI` targets `/api/assistant/*`, which has no Vercel function — Medium

**Where:** `src/pages/AskAI.tsx:48` (`/api/assistant/chat`) and `:90`
(`/api/assistant/feedback`). The assistant handler lives only in the Express app
(`server/routes/assistant.ts`); there is **no `api/assistant*`** edge function, and
`server/` is not referenced by `vercel.json` (only `package.json`'s `dev:server`).

**Why it matters:** on the Vercel deployment, `/api/assistant/chat` matches no function.
The SPA rewrite in `vercel.json` explicitly excludes `/api/`, so it 404s. `apiRequest`'s
mock fallback only triggers in `import.meta.env.DEV`, so production users of the "Ask AI"
page get a hard failure, not a graceful message.

**Failure scenario:** user opens Ask AI in prod → request 404s → error state.

**Fix:** either port the assistant to an `api/assistant/chat.ts` edge function (matching the
pattern the rest of `api/` uses), or deploy `server/` behind `/api` and route to it. Confirm
which backend is the production target (see finding 10) and make the assistant follow it.

---

## 5. CORS allow-origin points at the non-canonical host — Low

**Where:** `vercel.json` → `/api/(.*)` header block:
`Access-Control-Allow-Origin: https://myraw.app` with `Allow-Credentials: true`. But the
redirects in the same file force `myraw.app` → **`https://www.myraw.app`**, so the canonical
origin is `www.myraw.app`.

**Why it matters:** a credentialed cross-origin request from the canonical `www.` origin
won't match `https://myraw.app` and the browser blocks it. Same-origin calls (the normal
case) are unaffected, which is why it mostly "works" — but any genuine cross-origin client is
mis-served, and a static single-value ACAO with credentials is brittle. Note the app's real
CSRF defence is the `SameSite=Lax` cookie + `isTrustedOrigin()` check, not this header.

**Fix:** set ACAO to `https://www.myraw.app` (the canonical origin), or drop the static
header and let the edge functions echo a validated origin. Keep `isTrustedOrigin()` as the
gate.

---

## 6. `middleware.ts` reflects `invite` into HTML unescaped — Low

**Where:** `middleware.ts` builds an OG-preview HTML document for bots and interpolates
`url.searchParams.get("invite")` straight into `<title>`, `og:description`, `og:url`, etc.
with no escaping.

**Why it matters:** it only runs for crawler user-agents and bots don't execute JS, so this
isn't drive-by XSS against users. But an attacker-crafted `?invite="><meta …>` breaks out of
the attribute/tag and injects arbitrary markup into the link preview a victim sees in
Slack/iMessage/etc. — a phishing-content vector, and sloppy reflection.

**Failure scenario:** shared link `…/?invite="><script>…` (or injected meta) renders
attacker-controlled preview text/markup in chat unfurls.

**Fix:** HTML-escape `invite` before interpolation (`&`, `<`, `>`, `"`), or validate it
against the known code shape (`/^RAW-[12]-[A-Z0-9]{4,16}$/`, matching signup) and drop it
otherwise.

---

## 7. `delete-account` cleanup is non-transactional — Low

**Where:** `cleanupAppUserData()` in `api/_lib/authServer.ts` — ~18 sequential
`.delete().throwOnError()` calls across tables, ending with the `users` row.

**Why it matters:** if any middle step throws (transient error, constraint), the ones before
it have already committed and the `users` row (deleted last) survives. The account is left
partially wiped and the endpoint returns `app_cleanup_failed` — a retry re-runs the whole
sequence, but between attempts the user is in an inconsistent half-deleted state. For a
GDPR "delete my account" flow this is the wrong failure mode.

**Fix:** move the cascade into one `SECURITY DEFINER` RPC that runs in a single transaction
(all-or-nothing), or add `ON DELETE CASCADE` FKs to the child tables and delete only the
`users` row.

---

## 8. `apiRequest` lets caller headers clobber the merge — Low

**Where:** `src/lib/api/client.ts` — the fetch options are
`{ credentials, headers: { 'Content-Type': …, ...init?.headers }, ...init }`. Because
`...init` is spread **after** the composed `headers`, an `init` that itself carries a
`headers` key replaces the merged object wholesale.

**Why it matters:** any caller passing `headers` silently loses the default
`Content-Type: application/json`, so a POST body can go up without the JSON content type.
Not a security issue, but a latent correctness footgun.

**Fix:** spread `...init` first, then set `headers` last:
`{ credentials: 'include', ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } }`.

---

## 9. Minted `authenticated` JWT stored in localStorage — Info / by-design

**Where:** `applySupabaseSession()` in
`src/backend/supabase/controllers/authController.ts` writes the API-minted Supabase JWT
(claims `role: authenticated`, 7-day TTL from `SESSION_TTL_SECONDS`) into
`localStorage['sb-<ref>-auth-token']` so `supabase-js` attaches it to direct RLS calls.

**Why it matters:** localStorage is readable by any script, so an XSS anywhere in the app
yields a 7-day, fully-authenticated token — account takeover that outlives a session
cookie. This is the documented tradeoff for making `current_user_id()`/`auth.uid()` work
from the browser (see `docs/architecture-review.md`); React's default escaping keeps the
XSS surface small (only the static FAQ JSON-LD uses `dangerouslySetInnerHTML`, and chat/user
content is never `innerHTML`'d). Flagging it so it's a conscious choice, not a surprise.

**Options:** shorten the browser token TTL (mint a short-lived one for RLS calls, refreshed
via the HttpOnly-cookie `/api/auth/me`), or keep all privileged writes server-side (as
`chat/send`, `communities/*`, and `tokens` already do) and stop persisting the JWT client-side.

---

## 10. Two parallel auth backends; the Express one ignores bans — Info

**Where:** `api/` (Vercel edge, Supabase-backed, `raw_session` cookie JWT) vs `server/`
(Express, `express-session`, **in-memory** `userRepository`). The frontend
(`authController.ts`, `AskAI.tsx`) only calls `/api/...`. `server/` is invoked solely by
`dev:server` and isn't in `vercel.json`.

**Why it matters:** `server/routes/auth.ts`'s `toAuthUser()` hard-codes
`role: "member", status: "active"` for every user — it has no concept of bans, timeouts, or
admin roles. If `server/` is ever fronted as the production `/api` (it's a complete auth +
polls + assistant service), moderation is silently bypassed. If it's dead/legacy, it's a
large attack surface and maintenance burden sitting in the tree. Either way the ambiguity is
a risk.

**Fix:** decide the source of truth. If `api/` is production, mark `server/` clearly as
local-dev-only (or delete it) and move the assistant into `api/` (finding 4). If `server/` is
deployed somewhere, document where and reconcile its user model with the Supabase one.

---

## What's solid (don't regress these)

- **RLS hardening is thorough and correct.** `20260603170000_harden_rls_security.sql`,
  `20260630010000_harden_user_owned_tables.sql`, and
  `20260630020000_harden_communities_write_access.sql` revoke `anon` writes, scope every
  user-owned table to `current_user_id()`, and gate admin surfaces behind `is_admin()`.
- **Column-level `GRANT UPDATE`** on `users` is limited to
  `(avatar_level, onboarding_completed, profile_public)`, so a user can't self-escalate
  `role`/`status`/`token_balance` even via direct PostgREST.
- **SECURITY DEFINER functions** all pin `search_path`, `REVOKE … FROM PUBLIC`, and derive
  identity from `current_user_id()` — `spend_tokens` and `submit_poll_vote` take no
  user-id argument, so impersonation via the URL/body is impossible.
- **Server-authoritative writes:** chat send, community join/leave, token spend go through
  the verified `raw_session` cookie + service-role client, not forgeable browser RLS.
- **Blocked-word enforcement** is duplicated server-side (`checkServerText` in
  `api/chat/send.ts` *and* `text_contains_blocked_word` inside `send_community_message`), so
  the client check is UX-only and can't be bypassed by calling the RPC directly.
- **Auth hygiene:** constant-time cron-secret compare (`server/routes/cron.ts`),
  magic-link email-enumeration protection, prompt-injection sanitisation of assistant
  feedback, no service-role key or secret reachable from `src/`.

---

## Recommended order of work

1. **Finding 2** (timeout lockout) and **Finding 3** (missing vote migration) — user-facing
   breakage, small diffs.
2. **Finding 1** (bcrypt cost) — one migration, meaningful risk reduction.
3. **Finding 4 / 10** — resolve the backend split and the broken Ask AI page together.
4. **Findings 5–8** — quick hardening/correctness cleanups.
5. **Finding 9** — decide and document the token-storage tradeoff.
