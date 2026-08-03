<img src="./readme/card-titles/title1.svg"/>
<br>

## License

Add a `LICENSE` file before distributing or reusing this project outside its intended scope.

<br><br>
<!-- project overview -->
<img src="./readme/card-titles/title2.svg"/>

> raW is a privacy-first social polling and community app built around anonymous polls, interest-based chats, avatar identity, rewards, moderation, and admin workflows.<br>
> The platform combines a Vite + React frontend, Supabase-backed data/auth flows, Vercel Edge API routes, Capacitor mobile builds, and observability/security tooling for production readiness.

<br>
<!-- System Design -->
<img src="./readme/card-titles/title3.svg"/>

### Application Architecture

| Layer | Purpose |
|------|---------|
| **Vite + React App** | Main social polling, community, chat, avatar, and admin experience |
| **Supabase Backend** | Database, RPC-driven auth flows, access boundaries, and server-side app data |
| **Vercel Edge API** | Production API under top-level `api/`, including auth, polls, chat, moderation, notifications, and monitoring |
| **Local Express Server** | `server/index.ts` for local-only development flows through `npm run dev:server` |
| **Capacitor Mobile Shell** | iOS and Android packaging for native app builds |
| **Observability + Safety** | Sentry, PostHog, secret scanning, security notes, and moderation workflows |

<br>

### Repository Map

| Path | Description |
|------|-------------|
| `src/App.tsx` | Main React app shell |
| `src/pages` | Primary app pages and routes |
| `src/features` | Feature-specific frontend modules |
| `src/backend/supabase` | Supabase-oriented client/backend controller logic |
| `api/` | Production Vercel Edge/serverless API routes |
| `server/` | Local-only Express server used by `npm run dev:server` |
| `supabase/` | Supabase migrations, config, and backend assets |
| `docs/` | Architecture, security, analytics, mobile, SEO, and monitoring documentation |
| `ios/` / `mobile/` | Native/mobile project support |
| `vercel.json` | Production deployment routing |

<br><br>
<!-- Project Highlights -->
<img src="./readme/card-titles/title4.svg"/>

### Core Features

- **Anonymous social polling**: Create and participate in privacy-first polls without exposing real identity.<br>
- **Interest communities**: Join topic-based community spaces and chats.<br>
- **Avatar identity**: Use avatar-based presence instead of real-name social identity.<br>
- **Rewards and token requests**: Support gamified participation and token-related workflows.<br>
- **Moderation tooling**: Provide admin and moderation surfaces for safety, content review, and abuse handling.<br>
- **Notifications**: Support notification workflows across app and mobile surfaces.<br>
- **Mobile readiness**: Capacitor setup for native iOS and Android packaging.<br>

<br>

### Production Backend Note

| Environment | Backend |
|-------------|---------|
| **Production** | Top-level `api/` Vercel Edge/serverless functions |
| **Local frontend** | `npm run dev` Vite app |
| **Local backend routes** | `server/index.ts` through `npm run dev:server` |

The production backend is `api/`, not `server/`. Vercel auto-detects files under `api/` as functions, and `vercel.json` excludes `api/**` from the SPA rewrite so routes remain reachable at `/api/...`.

Auth is served in production by:

```text
api/auth/signup.ts
api/auth/login.ts
api/auth/me.ts
api/auth/logout.ts
```

The local `server/index.ts` auth implementation is separate and is not started in production. See `docs/architecture-review.md` and `docs/SECURITY_NOTES.md` for the known split-brain note and required production env behavior.

<br>
<!-- Demo -->
<img src="./readme/card-titles/title5.svg"/>

### Local Setup

Install dependencies:

```sh
npm ci
```

Create a local environment file:

```sh
cp .env.example .env.local
```

Fill in the required Supabase, auth, analytics, notification, and server values in `.env.local`. Keep secrets out of source control.

Start the frontend:

```sh
npm run dev
```

Start the local API server when backend routes are needed:

```sh
npm run dev:server
```

<br>

### Vercel Deployment

The app is configured for Vercel:

| Setting | Value |
|---------|-------|
| **Framework** | Vite |
| **Install Command** | `npm ci --prefer-offline` |
| **Build Command** | `vite build` |
| **Output Directory** | `dist` |

Production deployment requires Vercel environment variables to match `.env.example`, including Supabase client/server keys, auth secrets, analytics keys, Sentry/PostHog settings, notification credentials, and any cron or AI assistant secrets used by backend routes.

<br><br>
<!-- Development & Testing -->
<img src="./readme/card-titles/title6.svg"/>

### Checks

| Command | Purpose |
|---------|---------|
| `npm run typecheck` | Run TypeScript project checks |
| `npm run lint` | Run ESLint |
| `npm run lint:ci` | Run ESLint with zero-warning policy |
| `npm run test` | Run Vitest unit tests |
| `npm run test:server` | Run server test suite |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run build` | Create a production build |
| `npm run verify` | Typecheck, lint, test, and build |
| `npm run secrets:scan` | Run repository secret scan |
| `npm run daily:scan` | Run daily repository scan script |

<br>

### Mobile Builds

Capacitor is configured for native builds. After frontend changes that affect the mobile shell, run:

```sh
npm run cap:sync
```

Then build and test through the native iOS or Android tooling.

Common mobile commands:

| Command | Purpose |
|---------|---------|
| `npm run mobile:sync:ios` | Build and sync iOS project |
| `npm run mobile:sync:android` | Build and sync Android project |
| `npm run mobile:open:ios` | Open native iOS project |
| `npm run mobile:open:android` | Open native Android project |

<br><br>
<!-- Extras -->
<img src="./readme/card-titles/title7.svg"/>

### Additional Tools & Services

| Tool | Purpose |
|------|---------|
| **React** | Frontend app experience |
| **Vite** | Development server and production build |
| **TypeScript** | Type-safe application code |
| **Tailwind CSS** | UI styling system |
| **shadcn-ui / Radix UI** | Accessible interface primitives |
| **Supabase** | Data, auth, RPC, and backend integration |
| **Vercel** | Static hosting and Edge/serverless API routes |
| **Capacitor** | Native iOS and Android app shell |
| **Sentry** | Error monitoring |
| **PostHog** | Product analytics |
| **Playwright** | End-to-end testing |
| **Vitest** | Unit and server tests |

<br>

### Repository Notes

- Do not commit `.env.local` or other secret-bearing files.
- Keep pull requests focused and run the relevant checks before review.
- Update `CHANGELOG.md` only for production behavior changes.

<br>

---

**raW** - Privacy-first anonymous polling, communities, and avatar-based social interaction.

*Community without oversharing.*
