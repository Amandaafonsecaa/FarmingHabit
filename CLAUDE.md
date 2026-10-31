# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

FarmingHabit is a gamified, Stardew-style habit tracker. UI text, code comments and commit messages are in Brazilian Portuguese — keep that. Two independent npm projects (no root package.json, no workspaces):

- `frontend/` — React 19 + Vite + Tailwind v4 + TypeScript
- `backend/` — NestJS 11 + Prisma 6 on Supabase Postgres (+ Supabase Storage)

The repo started as frontend only; the backend was added later. The root `README.md` covers both projects; `frontend/README.md` and `backend/README.md` describe each one.

## Commands

Frontend (`cd frontend`):
- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — typecheck + production build

The frontend has no tests and no linter; `typecheck` is the verification step.

Backend (`cd backend`):
- `npm run start:dev` — Nest in watch mode (http://localhost:3000, Swagger at `/api`)
- `npm run lint` — ESLint with `--fix`
- `npm test` — Jest unit tests (`src/**/*.spec.ts`); single file: `npx jest src/rewards/services/rewards.service.spec.ts`, single test: add `-t "<name>"`
- `npm run test:shop:integration` — builds, then runs `test/shop.integration.cjs` against the **real database** in `.env` (creates and removes its own fixtures, including Supabase auth users via the admin API with the service role key)
- `npm run db:deploy` / `npm run db:status` — apply / inspect Prisma migrations
- `npm run db:storage` — runs `prisma/supabase/motivation-storage.sql` (storage bucket setup)

Docker (repo root): `docker compose up --build -d` (API on 3000, site on 8080 via Nginx), `docker compose run --rm migrate` (migrations on demand, never at container start). The backend gets secrets from `backend/.env` via `env_file` (excluded from the image by `.dockerignore`); the frontend build reads the public `VITE_*` from `frontend/.env`. Lockfiles must stay complete for Linux: if `npm ci` in the image fails with "Missing ... from lock file", regenerate with `npx npm@<image npm version> install --package-lock-only`.

Migrations are hand-written SQL folders under `prisma/migrations/` and applied with `migrate deploy`. `DIRECT_URL` (session/direct connection, port 5432) is used for migrations; `DATABASE_URL` for runtime. Both point to the Supabase **session pooler** (`aws-0-us-east-1.pooler.supabase.com:5432`, user `postgres.<ref>`): the direct host `db.<ref>.supabase.co` is IPv6-only and fails with P1001 on networks without IPv6. See `backend/.env.example`. Do not use `migrate dev`: its shadow database has no `auth` schema, so migrations that touch `auth.users` fail there.

Every table in `public` has RLS enabled with no policies and no privileges for `anon` or `authenticated` (migration `20261031140000_lock_direct_access`): only the backend touches data. The backend connects as `postgres` (table owner, `BYPASSRLS`), so it is unaffected. **Any migration that creates a table must also `ENABLE ROW LEVEL SECURITY` and `REVOKE ALL ... FROM anon, authenticated`**, or the table is readable and writable through Supabase's public REST API with the anon key shipped in the frontend (plus a logged-in user's JWT).

## Environment

- `backend/.env`: `DATABASE_URL`, `DIRECT_URL`, `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (service role stays backend-only), `CORS_ORIGIN` (site origins allowed to call the API, comma-separated; default `http://localhost:5173,http://localhost:8080`). `NODE_ENV=production` turns Swagger off.
- `backend/.env` also takes `SUPABASE_JWT_SECRET` only for legacy projects that sign tokens with HS256; asymmetric projects are verified through the project's JWKS and don't need it.
- `frontend/.env`: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (required: without them the app shows the login screen with a config warning), `VITE_API_URL` (default `http://localhost:3000`).

## Architecture

### Auth — Supabase Auth, the token is the user
- Front: `main.tsx` boots with or without a session. No session → `components/auth/AuthScreen.tsx` (e-mail/password, sign-up and sign-in). With a session the app renders immediately from `localStorage` and `startCloudSync()` pulls the account in the background; only the first open of an account in a browser (no sync meta yet, `hasLocalSnapshot()`) waits for the pull behind `BootSplash`. Sign-in reloads the page; `SIGNED_OUT` clears `localStorage` and reloads, so one browser never mixes two accounts' data.
- `services/api.ts` `request()` injects `Authorization: Bearer <access_token>` on every call (token from `lib/auth.ts`). Do not pass user ids from the front: the backend never reads them.
- Back: `AuthGuard` is global (`APP_GUARD` in `app.module.ts`). It verifies the JWT (`auth/supabase-token.ts`, `jose`), creates the `User` row on first access (`UsersService.ensureUser`), and exposes `request.user`. Controllers get it with `@CurrentUser()`. Services take `userId` as a plain argument from the controller.
- `User.id` **is** the `auth.users.id` UUID (no default in Prisma). Since `users.id` is `text` and `auth.users.id` is `uuid`, a real FK is impossible: migration `20261027120000_auth_user_link` links them with triggers instead (a new or re-keyed player must exist in `auth.users`; deleting an auth user deletes the player and, by cascade, all their data). Players created before the login stay unlinked.
- Routes are per player: `/users/me`, `/users/me/storage/:key`, `/users/me/motivation`, `/users/me/data`, `/goals`, `/missions`, `/rewards`, `/purchases`, `/progress/claims`. Ownership is enforced in services (`findOwned` for missions edits, visible-or-global for reads, claims check owner).

All HTTP calls go through `services/api.ts`..

### Two persistence models
1. **Server-owned relational data** (Prisma models in `backend/prisma/schema.prisma`): `User` (level/xp/coins), `Mission`, `Reward`, `Purchase`, `RewardOverride`, `Motivation`. Coin/XP-changing operations run in transactions on the backend (see "Economy" below).
2. **localStorage blobs synced to the server** — goal definitions, diary, adventures, profile, settings, wish list, etc. live in `localStorage` under `farminghabit.*` keys and are read/written directly by hooks and `lib/` modules. `frontend/src/lib/cloudSync.ts` monkey-patches `Storage.prototype.setItem/removeItem`: writes to keys in `SYNC_KEYS` are debounced and `PUT` to `/users/me/storage/:key` (the `UserData` table, one JSON string per key, last `updatedAt` wins; the backend accepts only the keys in `SYNC_DATA_KEYS` in `users.service.ts`, which must match the front `SYNC_KEYS`). Keys updated by the background pull are announced with a `storage` event; any component that copies a synced key into React state must listen with `hooks/useStorageChange.ts` (also gives cross-tab updates). Keys that were absent when the app opened take the account's value even if the screen wrote a default before the pull finished (e.g. seeded example goals), so defaults never overwrite the account.

When adding a new persisted feature stored in localStorage, add its key to `SYNC_KEYS` and to `SYNC_DATA_KEYS` in the backend (and to `LOCAL_KEYS`/`ACCOUNT_KEYS` in `lib/settings.ts` so reset/export cover it). Purely visual UI state (calendar flip, cat visit) is deliberately not synced.

**Goals are split:** definitions live in the `farminghabit.goals.v1` blob (`{ goals }`), the daily history lives in the `goal_checkins` table (one row per player × goal × day, so two devices never overwrite each other). Front: `hooks/useGoalTracker.ts` exposes the same `GoalLog` shape built by `lib/checkins.ts`, which keeps a local cache (`farminghabit.checkins.cache.v1`), an offline queue (`farminghabit.checkins.pending.v1`, retried on open and on the `online` event), sends one check-in at a time, and on open uploads any legacy `log` still inside the blob (`POST /goals/checkins/import`, never pays). `lib/goalLogic.ts` reads that `GoalLog` unchanged.

### Economy is server-only
- The backend decides every coin/XP/level change. `PATCH /users/me` accepts only `name`; there is no endpoint that sets a balance.
- Sources of income: mission completion (`MissionsService`, value capped at `MISSION_LIMITS`, rewards locked while the mission is completed so undo always refunds the same amount), goal harvest and weekly bonus, paid by the check-in itself (`PUT /goals/:goalId/checkins/:day`: upsert + payment in one transaction, only for today and only when the goal's daily target is reached). Spending: shop purchases (`RewardsService.claimReward`).
- `src/progress/`: `economy.ts` (amounts, level rule, "today" window), `goal-rules.ts` (parses goal definitions from the blob and checks the week from per-day amounts), `ledger.ts` (`payOnce(tx, …)`: writes `reward_claims` and adjusts the wallet inside the caller's transaction), `wallet.ts` (`adjustWallet`: one atomic `UPDATE` that adds/subtracts, floors at 0 and recomputes level).
- `reward_claims` is the ledger: primary key `(userId, key)` + `createMany({ skipDuplicates })` makes every harvest/bonus pay once even under concurrent requests. Old `chest` rows stay as history (chests and cards were removed from the game).
- Front: `lib/checkins.ts` `sendCheckin` flushes the goals blob if it is still pending (a brand-new goal must be known to the server to pay), then sends the check-in; a paid result broadcasts the updated player with `PLAYER_EVENT`, and `settleCheckin` in `lib/harvestRewards.ts` shows coins/toast. `HARVEST_REWARD`/`WEEK_BONUS` in the front are copy-only mirrors for UI text. Weekly earnings in Evolution come from `GET /progress/claims`.

### Shop catalog
`backend/src/rewards/catalog.ts` is the fixed global showcase; `RewardsService.onModuleInit` upserts it by `key` on every server start. Global rewards have `userId = null`; per-user edits/hiding of global items go into `RewardOverride` rather than mutating the shared row. Purchases snapshot title/price.

### Frontend structure
- `App.tsx` does hash routing (`#metas`, `#missoes`, `#diario`, `#evolucao`, `#configuracoes`, `#loja`; empty = home) — no router library. Each page receives `onNavigate`. `WelcomeWizard` overlays until the profile is onboarded.
- `pages/` compose feature components from `components/<feature>/`; state lives in `hooks/use*.ts`; pure game logic and storage helpers in `lib/`.
- Styling: one CSS file per page in `src/styles/`, all imported in `main.tsx`; Tailwind tokens via `@theme` in `global.css` (no tailwind.config). Art is hand-written SVG/pixel components in TSX.
- Shared modal shell: `components/dialogs/GameDialog.tsx`. Feedback via toasts (`lib/toast.ts`, `components/Toaster.tsx`); the auth screen mounts its own `Toaster` because it renders outside `MainLayout`.

### Backend structure
Standard Nest feature modules (`users`, `goals`, `missions`, `rewards`) each with `controllers/`, `services/`, `dto/`, `entities/`; `auth/` holds the guard, token verification and `@CurrentUser()`. Global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted`, so every accepted field must be declared in a DTO with class-validator decorators. JSON body limit is 1 MB (motivation photo arrives as a data URL and is uploaded to the private `motivation-photos` bucket by `storage/supabase-storage.service.ts`).

## Design and UI/UX (apply to every front-end change)

These rules override generic UI habits. Keep UI copy in pt-BR; this file is in English.

### Visual identity
- Cozy pixel art, Stardew Valley-inspired farm. Aim for that feel, not a generic dashboard.
- Use the palette tokens in `frontend/src/styles/global.css` (`cream`, `paper`, `brown`, `muted`, `sage`, `olive`, `gold`, `terracotta`, `wood`, `line`). Don't introduce new colors unless extending the palette on purpose.
- Pixel language: square corners, hard offset shadows with no blur, 3px solid borders, layered inset highlights (see `.pixel-frame`, `.panel-heading`, `.pixel-button`). No rounded corners, glassmorphism or soft gradients. The only texture is the subtle dot pattern in `.panel-content`.
- Font is the monospace stack in `global.css`, bold for headings and labels.
- Art (character, house, trees, signs, icons) is hand-made SVG/pixel components. Don't redraw existing artwork unless asked; previous attempts were rejected. The character only breathes.
- Ambient life (birds, butterflies, clouds, smoke, fish) is welcome. Respect `prefers-reduced-motion`.

### Design system and symmetry
- Reuse the existing primitives before writing new ones: `.pixel-frame`, `.world-panel`, `.panel-heading`, `.panel-content`, `.panel-footer`, `.pixel-button` (with `.mission-button` / `.add-button`), `.pixel-progress`, `.item-icon`, `.completion-square`, `PixelIcon`, `GameDialog`, and the toast in `lib/toast.ts`.
- Symmetry: paired or sibling elements share the same geometry. Left and right padding match, panels in a row share height and internal alignment, and mirrored ornaments (like the corner pins on `.world-panel`) stay mirrored. Equal border weight and inset highlights across siblings.
- Consistent rhythm: use the existing gaps and paddings (for example `gap-3` between panels, `px-3 py-2` in headings, `py-3` for rows) rather than one-off values.
- Lists align to a shared column: the icon, then the title, then the meta row starting at the icon's left edge.
- Components with the same role look the same everywhere. If a fix touches a shared component, check every screen that uses it.

### Minimal text
- Prefer visual cues (icons, hover outline, cursor change, glow) to explanatory sentences. Don't add hint lines, "ver todas" links or labels that state the obvious.
- Action feedback (saved, deleted, error) goes in the toast, never in a modal body.
- Every add/edit modal uses the shared `GameDialog` shell so they open and close the same way.

### Layout and composition
- The approved composition is the baseline: the home scene sits above three panels on desktop, and the panels stack on small screens. Preserve the composition, visual identity and hierarchy.
- Fix alignment, indentation, spacing and proportion inside a component, pointwise. Don't turn sections full width, swap columns, convert cards, add a global layout file, or stretch panels to fill space.
- If a fix really needs a structural change, show a before/after of one screen and wait for approval before applying it elsewhere.
- Avoid empty areas that serve no purpose, unbalanced columns, cramped elements and oversized elements. Let the composition follow the content.

### UX completion criteria
Treat these as part of "done" for every change:
- Clear navigation and actions whose purpose is obvious. Keep keyboard focus visible, controls reachable with Tab/Enter, and labels and contrast readable.
- Every data view has feedback for loading, success, error and empty states.
- Check the affected screens at phone and desktop widths, with few items and with many. Long titles and long lists must not break the layout.
- Before finishing, review the affected screens visually, including shared components. If something can't be verified (for example, no browser available), say so in the final message instead of implying it was checked.
