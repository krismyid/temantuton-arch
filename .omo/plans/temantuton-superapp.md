# TemanTuton Superapp — Work Plan

## TL;DR

> **Quick Summary**: Build TemanTuton superapp for Universitas Terbuka students — Microsoft OAuth SSO (auth-worker), Podcast feature (podcast-worker), and gamified Dojo exam prep (dojo-worker) on Cloudflare infra, Next.js PWA frontend.
>
> **Deliverables**:
> - auth-worker: Microsoft OAuth BFF with KV sessions, D1 user store
> - podcast-worker: Podcast CRUD API, backoffice admin, langflow webhook
> - dojo-worker: PDF→LLM question pipeline, gamification engine
> - Next.js PWA: Mobile-web compatible, offline support (256MB audio cache)
>
> **Estimated Effort**: XL (50+ tasks)
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Auth Worker → D1 Schema → SSO Middleware → Podcast API → Dojo Pipeline

---

## Context

### Original Request
Build TemanTuton superapp for UT students. Unofficial. SSO via Microsoft OAuth restricted to @ecampus.ut.ac.id.

### Interview Summary
**Key Discussions**:
- Microsoft OAuth + Azure AD tenant restriction + claim filter for domain validation
- Cloudflare infra: separate Workers per feature (auth-worker, podcast-worker, dojo-worker), D1, R2, KV
- Fresh Next.js PWA, web-only, mobile-web compatible, offline support
- Podcast: rebuild from demo, backoffice admin UI, API for langflow/n2n
- Dojo: PDF→OpenDataLoader→Markdown→databyte-m1 LLM→questions, Bahasa Indonesia 20s style, gamification (XP/badges/streaks/levels)
- PDF from UT ebook reader, latihan soal section only, attribute source
- Session TTL: 30d absolute
- Audio cache: 256MB/user (~4-8 files)

### Research Findings
- Podcast demo: vanilla HTML/CSS/JS, PWA manifest, IndexedDB progress, data embedded at build time
- Cloudflare auth: bezzie BFF pattern, Workers KV for sessions (NOT D1), jose for JWT, tenant restriction in Azure AD
- Key pitfalls: MSAL.js incompatible with Workers (use manual OAuth + jose), Azure AD JWKS non-standard, D1 eventual consistency

### Metis Review
**Identified Gaps (addressed)**:
- Session TTL: 30d absolute (resolved)
- LLM provider: databyte-m1 (resolved)
- PDF copyright: scraped from UT ebook reader, latihan soal only, attribute source (resolved)
- Audio cache: 256MB/user (resolved)
- Missing AC criteria: all added to plan (Section 5)

---

## Work Objectives

### Core Objective
Build TemanTuton superapp: SSO + Podcast + Dojo on Cloudflare + Next.js PWA

### Concrete Deliverables
- auth-worker: OAuth BFF, KV sessions, D1 users/audit
- podcast-worker: Podcast CRUD, backoffice, langflow webhook
- dojo-worker: PDF pipeline, gamification engine
- Next.js PWA: standalone, offline, 256MB audio cache
- D1 schemas: users, audit_log, podcasts, episodes, questions, xp_log, badges, streaks
- R2 buckets: audio (podcast), avatars

### Definition of Done
- [ ] Microsoft OAuth login works for @ecampus.ut.ac.id only
- [ ] Podcast plays offline after cache
- [ ] Dojo generates questions from PDF via LLM
- [ ] Gamification: XP, badges, streaks, leaderboard functional
- [ ] PWA installable and works offline

### Must Have
- Microsoft OAuth with domain restriction to @ecampus.ut.ac.id
- BFF pattern with KV sessions (NOT D1)
- JWT validation via jose library (NOT MSAL.js)
- 3 separate Workers (auth, podcast, dojo)
- PWA with service worker
- Offline podcast audio (256MB limit)
- Offline dojo (question cache)
- Backoffice admin UI for podcast management
- langflow webhook API
- Gamification: XP, badges, streaks, levels, leaderboard
- PDF → Markdown → LLM → questions pipeline
- Source attribution for UT materials

### Must NOT Have
- MSAL.js in Workers (incompatible)
- Sessions stored in D1 (use KV)
- Mobile native app (web-only)
- Payment gateway
- Official UT affiliation
- Full PDF distribution
- LLM calls from client-side code

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (fresh project)
- **Automated tests**: Tests-after (vitest)
- **Framework**: vitest
- **Agent-Executed QA**: Playwright for E2E

### QA Policy
Every task includes agent-executed QA scenarios. Evidence saved to `.omo/evidence/`.

---

## Execution Strategy

### Wave 1 — Foundation (Auth + Infra)
- Auth Worker scaffold
- D1 schema + migrations
- KV session config
- Next.js PWA scaffold
- R2 bucket setup
- Microsoft OAuth app registration guide

### Wave 2 — SSO Core
- OAuth BFF implementation
- JWT validation with jose
- KV session storage
- Domain restriction (@ecampus.ut.ac.id)
- Session middleware
- Next.js auth integration

### Wave 3 — Podcast Feature
- Podcast Worker API
- Backoffice admin UI
- R2 audio upload
- langflow webhook
- PWA audio cache (256MB)
- Podcast player UI

### Wave 4 — Dojo Feature
- PDF upload pipeline
- OpenDataLoader → Markdown
- databyte-m1 LLM integration
- Question generation
- Gamification engine (XP/badges/streaks)
- Leaderboard
- Dojo UI

### Wave FINAL — Integration + QA
- Full E2E testing
- PWA offline verification
- Performance audit
- Security review

---


## TODOs

- [ ] 1. **Auth Worker scaffold**

  **What to do**:
  - Create `auth-worker/` directory with `wrangler.toml`
  - Initialize Hono server with TypeScript
  - Configure KV namespace (`SESSION_KV`) binding
  - Configure D1 database (`AUTH_DB`) binding
  - Set up environment variables: `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `AZURE_TENANT_ID`, `REDIRECT_URI`
  - Add CORS headers for frontend origin
  - Deploy to Cloudflare Workers

  **Must NOT do**:
  - Use MSAL.js (incompatible with Workers)
  - Store sessions in D1 (use KV)
  - Hardcode secrets in code

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `cloudflare-workers`]
  - `typescript`: TypeScript throughout
  - `cloudflare-workers`: Worker deployment patterns
  - **Skills Evaluated but Omitted**:
    - `playwright`: N/A for scaffolding

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5, 6, 7)
  - **Blocks**: Tasks 8, 9, 10, 11, 12
  - **Blocked By**: None

  **References**:
  - `https://developers.cloudflare.com/workers/` - Workers quick start
  - `https://hono.dev/` - Hono framework for routing
  - `https://github.com/neilpmas/bezzie` - bezzie BFF OAuth pattern

  **Acceptance Criteria**:
  - [ ] auth-worker deploys to Cloudflare Workers
  - [ ] `curl https://auth-worker.workers.dev/health` → `{"status":"ok"}`
  - [ ] KV namespace bound and accessible
  - [ ] D1 database bound and accessible
  - [ ] Environment variables loaded from wrangler.toml

  **QA Scenarios**:

  ```
  Scenario: Auth Worker health check
    Tool: Bash (curl)
    Preconditions: Worker deployed, no auth required
    Steps:
      1. curl -s https://auth-worker.workers.dev/health
    Expected Result: {"status":"ok"} with 200 status
    Failure Indicators: Connection refused, timeout, non-200 status
    Evidence: .omo/evidence/task-1-health.json

  Scenario: KV binding accessible
    Tool: Bash (wrangler)
    Preconditions: Worker deployed
    Steps:
      1. wrangler kv:key list --namespace-id=<KV_ID> --prefix="test"
    Expected Result: List command succeeds (may be empty)
    Failure Indicators: "namespace not found", permission denied
    Evidence: .omo/evidence/task-1-kv.json

  Scenario: D1 binding accessible
    Tool: Bash (wrangler)
    Preconditions: Worker deployed
    Steps:
      1. wrangler d1 execute <DB_ID> --command="SELECT 1"
    Expected Result: Query succeeds
    Failure Indicators: "database not found", permission denied
    Evidence: .omo/evidence/task-1-d1.json
  ```

  **Evidence to Capture**:
  - [ ] task-1-health.json
  - [ ] task-1-kv.json
  - [ ] task-1-d1.json

  **Commit**: YES
  - Message: `feat(auth): scaffold worker with Hono, KV, D1 bindings`
  - Files: `auth-worker/wrangler.toml`, `auth-worker/src/index.ts`, `auth-worker/src/routes/health.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 2. **D1 Auth Schema + Migrations**

  **What to do**:
  - Create D1 migration files in `auth-worker/migrations/`
  - Schema:
    ```sql
    CREATE TABLE users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      entra_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      display_name TEXT,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      metadata TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX idx_users_entra_id ON users(entra_id);
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
    ```
  - Apply migrations via `wrangler d1 migrations apply AUTH_DB`

  **Must NOT do**:
  - Store sessions in D1 (use KV)
  - Add password field (OAuth only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `cloudflare-workers`, `sql`]
  - `sql`: D1 SQLite schema design

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Tasks 8, 9, 10
  - **Blocked By**: None

  **References**:
  - `https://developers.cloudflare.com/d1/build-databases/query-databases/` - D1 queries
  - `https://developers.cloudflare.com/d1/best-practices/performance-exports/` - Index design

  **Acceptance Criteria**:
  - [ ] `wrangler d1 migrations apply AUTH_DB` succeeds
  - [ ] `SELECT * FROM users` returns empty table
  - [ ] `SELECT * FROM audit_log` returns empty table
  - [ ] Indexes created: users(entra_id), users(email), audit_log(user_id)

  **QA Scenarios**:

  ```
  Scenario: Migrations apply successfully
    Tool: Bash (wrangler)
    Preconditions: D1 database exists
    Steps:
      1. wrangler d1 migrations apply AUTH_DB --local
    Expected Result: "Migration applied successfully"
    Failure Indicators: Syntax error, duplicate migration
    Evidence: .omo/evidence/task-2-migrations.json

  Scenario: Tables created with correct schema
    Tool: Bash (wrangler)
    Preconditions: Migrations applied
    Steps:
      1. wrangler d1 execute AUTH_DB --command="SELECT sql FROM sqlite_master WHERE type='table'"
    Expected Result: Returns CREATE TABLE statements for users and audit_log
    Failure Indicators: Missing tables, wrong columns
    Evidence: .omo/evidence/task-2-schema.json

  Scenario: Indexes created
    Tool: Bash (wrangler)
    Preconditions: Migrations applied
    Steps:
      1. wrangler d1 execute AUTH_DB --command="SELECT name FROM sqlite_master WHERE type='index'"
    Expected Result: Returns idx_users_entra_id, idx_users_email, idx_audit_user
    Evidence: .omo/evidence/task-2-indexes.json
  ```

  **Evidence to Capture**:
  - [ ] task-2-migrations.json
  - [ ] task-2-schema.json
  - [ ] task-2-indexes.json

  **Commit**: YES
  - Message: `feat(auth): add D1 schema for users and audit_log`
  - Files: `auth-worker/migrations/0001_initial.sql`
  - Pre-commit: `wrangler d1 migrations apply AUTH_DB --local`

---

- [ ] 3. **Next.js PWA Scaffold**

  **What to do**:
  - Create `frontend/` directory with Next.js 14 (App Router)
  - Initialize with TypeScript
  - Configure PWA with `next-pwa` or manual service worker
  - Set up manifest.json:
    ```json
    {
      "name": "TemanTuton",
      "short_name": "TemanTuton",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#0f0f0f",
      "theme_color": "#4f9cf7",
      "orientation": "portrait-primary",
      "icons": [
        {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png"}
      ]
    }
    ```
  - Configure metadata and PWA meta tags
  - Set up directory structure: `app/`, `components/`, `lib/`, `hooks/`
  - Install dependencies: `jose`, `@tanstack/react-query`
  - Deploy to Cloudflare Pages

  **Must NOT do**:
  - Use API routes for auth (delegate to Workers)
  - Store tokens in localStorage (use HttpOnly cookies)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `next-js`, `pwa`]
  - `typescript`: TypeScript throughout
  - `next-js`: App Router patterns
  - `pwa`: Service worker, manifest

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Tasks 13, 14, 15
  - **Blocked By**: None

  **References**:
  - `https://nextjs.org/docs/app` - Next.js 14 App Router
  - `https://developer.chrome.com/docs/workbox/` - Workbox service worker
  - `https://github.com/krismyid/temantuton-podcast/blob/master/manifest.json` - Existing PWA config

  **Acceptance Criteria**:
  - [ ] `next dev` runs without errors
  - [ ] `manifest.json` served at `/manifest.json`
  - [ ] Service worker registered at `/_next/service-worker.js`
  - [ ] `curl -s https://pages.dev/manifest.json` returns valid manifest
  - [ ] PWA meta tags in `<head>`

  **QA Scenarios**:

  ```
  Scenario: PWA manifest is valid
    Tool: Bash (curl)
    Preconditions: Frontend deployed to Pages
    Steps:
      1. curl -s https://pages.dev/manifest.json | jq '.'
    Expected Result: Valid JSON with name, short_name, start_url, display, icons
    Failure Indicators: 404, invalid JSON, missing required fields
    Evidence: .omo/evidence/task-3-manifest.json

  Scenario: Service worker registered
    Tool: Bash (curl)
    Preconditions: Frontend deployed
    Steps:
      1. curl -sI https://pages.dev/_next/service-worker.js | grep content-type
    Expected Result: content-type: application/javascript
    Failure Indicators: 404
    Evidence: .omo/evidence/task-3-sw.json

  Scenario: PWA installable ( Lighthouse audit )
    Tool: Playwright (lighthouse)
    Preconditions: Frontend running locally
    Steps:
      1. npx lighthouse http://localhost:3000 --only-categories=pwa --output=json --output-path=./lighthouse-report.json
    Expected Result: PWA score >= 80
    Failure Indicators: PWA score < 80
    Evidence: .omo/evidence/task-3-pwa-score.json
  ```

  **Evidence to Capture**:
  - [ ] task-3-manifest.json
  - [ ] task-3-sw.json
  - [ ] task-3-pwa-score.json

  **Commit**: YES
  - Message: `feat(frontend): scaffold Next.js PWA`
  - Files: `frontend/`, excluding `node_modules/`, `.next/`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 4. **R2 Buckets Setup**

  **What to do**:
  - Create R2 bucket `temantuton-audio` for podcast audio
  - Create R2 bucket `temantuton-avatars` for user avatars
  - Configure CORS for audio bucket (allow GET from all origins):
    ```json
    [
      {
        "AllowedOrigins": ["https://temantuton.pages.dev", "http://localhost:3000"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedHeaders": ["*"]
      }
    ]
    ```
  - Add Worker permission to read/write buckets
  - Configure custom domain or `r2.dev` public URL

  **Must NOT do**:
  - Make buckets public (private with signed URLs)
  - Store large files in KV

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`cloudflare-workers`]
  - `cloudflare-workers`: R2 bindings and CORS

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Tasks 16, 17, 18
  - **Blocked By**: None

  **References**:
  - `https://developers.cloudflare.com/r2/` - R2 docs
  - `https://developers.cloudflare.com/r2/examples/cors/` - CORS config

  **Acceptance Criteria**:
  - [ ] `wrangler r2 bucket create temantuton-audio` succeeds
  - [ ] `wrangler r2 bucket create temantuton-avatars` succeeds
  - [ ] CORS configured for audio bucket
  - [ ] Worker can upload to bucket (test with `wrangler dev`)

  **QA Scenarios**:

  ```
  Scenario: Audio bucket created
    Tool: Bash (wrangler)
    Preconditions: Logged into Cloudflare
    Steps:
      1. wrangler r2 bucket list | grep temantuton-audio
    Expected Result: Bucket listed
    Failure Indicators: "bucket not found", auth error
    Evidence: .omo/evidence/task-4-buckets.json

  Scenario: CORS headers present on audio bucket
    Tool: Bash (curl)
    Preconditions: Bucket configured
    Steps:
      1. curl -sI https://temantuton-audio.<account>.r2.dev/test | grep -i cors
    Expected Result: CORS headers present
    Failure Indicators: No CORS headers
    Evidence: .omo/evidence/task-4-cors.json

  Scenario: Worker can upload file
    Tool: Bash (wrangler)
    Preconditions: Worker with R2 binding deployed
    Steps:
      1. echo "test" | wrangler dev --test-synthetic
    Expected Result: Upload succeeds without error
    Evidence: .omo/evidence/task-4-upload.json
  ```

  **Evidence to Capture**:
  - [ ] task-4-buckets.json
  - [ ] task-4-cors.json
  - [ ] task-4-upload.json

  **Commit**: YES
  - Message: `feat(infra): create R2 buckets for audio and avatars`
  - Files: `wrangler.toml` (updated with R2 bindings)
  - Pre-commit: None

---

- [ ] 5. **Microsoft OAuth App Registration Guide**

  **What to do**:
  - Document Azure AD app registration steps in `docs/azure-setup.md`:
    1. Register app in Entra ID (Azure Portal)
    2. Configure redirect URI: `https://auth.temantuton.workers.dev/auth/callback`
    3. Enable "ID tokens" and "Access tokens"
    4. Add scopes: `openid`, `profile`, `email`, `User.Read`, `offline_access`
    5. Configure tenant restriction (Organizations or specific tenant ID)
    6. Generate client secret
    7. Document `.dev.vars` template
  - Create `.dev.vars.example`:
    ```
    MICROSOFT_CLIENT_ID=your-client-id
    MICROSOFT_CLIENT_SECRET=your-client-secret
    AZURE_TENANT_ID=your-tenant-id
    REDIRECT_URI=https://auth.temantuton.workers.dev/auth/callback
    FRONTEND_URL=https://temantuton.pages.dev
    SESSION_SECRET=random-32-char-secret
    ```

  **Must NOT do**:
  - Commit actual secrets
  - Use implicit flow (deprecated)

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: [`documentation`]
  - `documentation`: Clear setup guide

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Tasks 8, 9, 10
  - **Blocked By**: None

  **References**:
  - `https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app` - App registration
  - `https://github.com/neilpmas/bezzie` - OAuth implementation reference

  **Acceptance Criteria**:
  - [ ] `docs/azure-setup.md` contains step-by-step guide
  - [ ] `.dev.vars.example` has all required variables
  - [ ] No actual secrets in repo

  **QA Scenarios**:

  ```
  Scenario: Docs exist and are readable
    Tool: Read
    Preconditions: Files created
    Steps:
      1. Read docs/azure-setup.md
      2. Read .dev.vars.example
    Expected Result: Both files exist, .dev.vars.example has MICROSOFT_CLIENT_ID placeholder
    Failure Indicators: File not found, .dev.vars has actual values
    Evidence: .omo/evidence/task-5-docs.json

  Scenario: No secrets in repo
    Tool: Bash (git)
    Preconditions: Git repo initialized
    Steps:
      1. git log --all --full-history -- .env | wc -l
    Expected Result: 0 (no .env in git history)
    Failure Indicators: Secrets in git history
    Evidence: .omo/evidence/task-5-secrets.json
  ```

  **Evidence to Capture**:
  - [ ] task-5-docs.json
  - [ ] task-5-secrets.json

  **Commit**: YES
  - Message: `docs: add Azure AD app registration guide`
  - Files: `docs/azure-setup.md`, `.dev.vars.example`
  - Pre-commit: None

---

- [ ] 6. **KV Session Store Config**

  **What to do**:
  - Create KV namespace `SESSION_KV` via `wrangler kv:namespace create SESSION_KV`
  - Configure in `wrangler.toml`:
    ```toml
    [[kv_namespaces]]
    binding = "SESSION_KV"
    id = "<namespace-id>"
    ```
  - Implement session schema:
    ```typescript
    interface Session {
      userId: string;
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
      createdAt: number;
    }
    ```
  - Create `src/lib/session.ts` with:
    - `createSession(userId, tokens)` → stores in KV with 30d TTL
    - `getSession(sessionId)` → retrieves from KV
    - `deleteSession(sessionId)` → removes from KV
    - `refreshSession(sessionId)` → rotates tokens
  - Session cookie: `__Host-session` HttpOnly, SameSite=Lax, Secure

  **Must NOT do**:
  - Store in D1 (use KV)
  - Use localStorage for tokens

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `cloudflare-workers`]
  - `typescript`: Session types
  - `cloudflare-workers`: KV operations

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Tasks 8, 9, 10
  - **Blocked By**: None

  **References**:
  - `https://developers.cloudflare.com/workers/runtime-api/apis/kv/` - KV API
  - `https://github.com/neilpmas/bezzie` - Session storage pattern

  **Acceptance Criteria**:
  - [ ] KV namespace created and bound
  - [ ] `createSession()` stores data with 30d TTL
  - [ ] `getSession()` retrieves valid session
  - [ ] `deleteSession()` removes session
  - [ ] Cookie is HttpOnly, Secure, SameSite=Lax

  **QA Scenarios**:

  ```
  Scenario: Create and retrieve session
    Tool: Bash (wrangler dev)
    Preconditions: Worker running locally
    Steps:
      1. curl -X POST http://localhost:8787/session/test -d '{"userId":"user123"}'
      2. curl http://localhost:8787/session/test
    Expected Result: Session data returned with TTL
    Failure Indicators: 404, missing data
    Evidence: .omo/evidence/task-6-session.json

  Scenario: Session expires after 30d
    Tool: Bash (wrangler)
    Preconditions: Session created
    Steps:
      1. wrangler kv:key get --namespace-id=<KV_ID> session:test
    Expected Result: Key has TTL ~30 days
    Failure Indicators: No TTL or wrong TTL
    Evidence: .omo/evidence/task-6-ttl.json
  ```

  **Evidence to Capture**:
  - [ ] task-6-session.json
  - [ ] task-6-ttl.json

  **Commit**: YES
  - Message: `feat(auth): add KV session store with 30d TTL`
  - Files: `auth-worker/src/lib/session.ts`, `auth-worker/wrangler.toml`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 7. **Auth Worker Routes Structure**

  **What to do**:
  - Set up Hono route structure:
    ```
    src/
    ├── index.ts           # Entry point
    ├── routes/
    │   ├── auth.ts        # /auth/* routes
    │   ├── user.ts        # /user/* routes
    │   └── health.ts      # /health
    ├── lib/
    │   ├── session.ts     # Session management
    │   ├── microsoft.ts   # OAuth client
    │   └── jwt.ts         # JWT validation
    └── middleware/
        ├── auth.ts        # Auth middleware
        └── cors.ts        # CORS middleware
    ```
  - Configure CORS for frontend origin
  - Set up error handling middleware
  - Add request logging

  **Must NOT do**:
  - Mix business logic in routes (use lib/)
  - Expose internal errors to client

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `hono`]
  - `hono`: Router structure

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: Tasks 8, 9, 10
  - **Blocked By**: Task 1

  **References**:
  - `https://hono.dev/` - Hono routing
  - `https://hono.dev/docs/middleware/` - Middleware

  **Acceptance Criteria**:
  - [ ] `/health` returns `{"status":"ok"}`
  - [ ] `/auth/*` routes mounted
  - [ ] `/user/*` routes mounted (protected)
  - [ ] CORS headers present for frontend origin
  - [ ] Unauthenticated requests to `/user/*` return 401

  **QA Scenarios**:

  ```
  Scenario: Health endpoint
    Tool: Bash (curl)
    Preconditions: Worker deployed
    Steps:
      1. curl http://localhost:8787/health
    Expected Result: {"status":"ok"}
    Failure Indicators: 404, error response
    Evidence: .omo/evidence/task-7-health.json

  Scenario: Protected route returns 401
    Tool: Bash (curl)
    Preconditions: Worker deployed
    Steps:
      1. curl http://localhost:8787/user/me
    Expected Result: 401 Unauthorized
    Failure Indicators: 200, 500, or missing 401
    Evidence: .omo/evidence/task-7-auth.json

  Scenario: CORS headers present
    Tool: Bash (curl)
    Preconditions: Worker deployed
    Steps:
      1. curl -I -X OPTIONS http://localhost:8787/health -H "Origin: http://localhost:3000"
    Expected Result: Access-Control-Allow-Origin header present
    Failure Indicators: Missing CORS headers
    Evidence: .omo/evidence/task-7-cors.json
  ```

  **Evidence to Capture**:
  - [ ] task-7-health.json
  - [ ] task-7-auth.json
  - [ ] task-7-cors.json

  **Commit**: YES
  - Message: `feat(auth): add route structure with Hono`
  - Files: `auth-worker/src/`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 8. **OAuth Authorization Code Flow**

  **What to do**:
  - Implement `/auth/login` endpoint:
    - Generate PKCE: `codeVerifier` (random 64-byte) + `codeChallenge` (SHA256)
    - Store `state` + `codeVerifier` in KV
    - Redirect to Microsoft:
      ```
      https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize?
        client_id={clientId}&
        response_type=code&
        redirect_uri={callbackUrl}&
        scope=openid email profile User.Read offline_access&
        code_challenge={challenge}&
        code_challenge_method=S256&
        state={state}
      ```
  - Implement `/auth/callback` endpoint:
    - Validate `state` from KV
    - Exchange `code` for tokens via `https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token`
    - Request body: grant_type, code, redirect_uri, client_id, client_secret, code_verifier
    - Store tokens in KV session (30d TTL)
    - Redirect to frontend with session cookie
  - Implement `/auth/logout` endpoint:
    - Delete session from KV
    - Clear session cookie
    - Redirect to Microsoft logout: `https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/logout`

  **Must NOT do**:
  - Use implicit flow (no `response_type=token`)
  - Skip PKCE verification

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `oauth`]
  - `typescript`: TypeScript throughout
  - `oauth`: OAuth 2.1 + PKCE flow

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2, with Tasks 9, 10, 11, 12)
  - **Blocks**: Tasks 13, 14
  - **Blocked By**: Tasks 1, 5, 6, 7

  **References**:
  - `https://github.com/neilpmas/bezzie` - BFF OAuth pattern
  - `https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow` - MS Auth Code Flow
  - `https://github.com/FlowiseAI/Flowise/blob/main/packages/server/src/enterprise/sso/AzureSSO.ts` - Azure SSO example

  **Acceptance Criteria**:
  - [ ] `/auth/login` redirects to Microsoft login page
  - [ ] `/auth/callback` exchanges code for tokens
  - [ ] `/auth/logout` clears session and redirects
  - [ ] Session cookie set with HttpOnly, Secure

  **QA Scenarios**:

  ```
  Scenario: Login redirects to Microsoft
    Tool: Bash (curl)
    Preconditions: Worker running
    Steps:
      1. curl -v http://localhost:8787/auth/login 2>&1 | grep -i location
    Expected Result: Location header contains login.microsoftonline.com
    Failure Indicators: 404, no redirect
    Evidence: .omo/evidence/task-8-login.json

  Scenario: Callback with valid code creates session
    Tool: Bash (curl)
    Preconditions: Mock Microsoft token endpoint
    Steps:
      1. curl -X POST http://localhost:8787/auth/callback -d 'code=test&state=test'
    Expected Result: Session cookie set, redirect to frontend
    Failure Indicators: 400, 500, no cookie
    Evidence: .omo/evidence/task-8-callback.json

  Scenario: Logout clears session
    Tool: Bash (curl)
    Preconditions: Valid session
    Steps:
      1. curl -v http://localhost:8787/auth/logout -b 'session=test-session-id'
    Expected Result: Session cookie cleared, redirect to logout
    Evidence: .omo/evidence/task-8-logout.json
  ```

  **Evidence to Capture**:
  - [ ] task-8-login.json
  - [ ] task-8-callback.json
  - [ ] task-8-logout.json

  **Commit**: YES
  - Message: `feat(auth): implement OAuth authorization code flow with PKCE`
  - Files: `auth-worker/src/routes/auth.ts`, `auth-worker/src/lib/microsoft.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 9. **JWT Validation with jose**

  **What to do**:
  - Implement JWT validation using `jose` library:
    ```typescript
    import * as jose from 'jose';

    async function getJWKS(tenantId: string): Promise<jose.JWTVerifyGetKey> {
      const configUrl = `https://login.microsoftonline.com/${tenantId}/v2.0/.well-known/openid-configuration`;
      const config = await fetch(configUrl).then(r => r.json());
      return jose.createRemoteJWKSet(new URL(config.jwks_uri));
    }

    async function validateToken(token: string, env: Env) {
      const jwks = await getJWKS(env.AZURE_TENANT_ID);
      const { payload } = await jose.jwtVerify(token, jwks, {
        issuer: `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/v2.0`,
        audience: env.MICROSOFT_CLIENT_ID,
      });
      return payload;
    }
    ```
  - Add JWKS caching (24h TTL)
  - Validate ID token after token exchange
  - Extract user info: `email`, `preferred_username`, `name`

  **Must NOT do**:
  - Use MSAL.js (incompatible)
  - Skip issuer/audience validation

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `jwt`]
  - `typescript`: TypeScript throughout
  - `jwt`: JWT validation with jose

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2, with Tasks 8, 10, 11, 12)
  - **Blocks**: Tasks 13, 14
  - **Blocked By**: Tasks 1, 5

  **References**:
  - `https://github.com/panva/jose` - jose library docs
  - `https://github.com/majiayu000/claude-skill-registry/blob/main/skills/design/azure-auth/SKILL.md` - Azure auth patterns

  **Acceptance Criteria**:
  - [ ] Valid Microsoft token passes validation
  - [ ] Invalid/expired token throws error
  - [ ] Email extracted from token payload
  - [ ] JWKS cached for 24h

  **QA Scenarios**:

  ```
  Scenario: Valid token validation
    Tool: Bash (curl)
    Preconditions: Worker running, valid test token
    Steps:
      1. curl -X POST http://localhost:8787/validate -H "Authorization: Bearer <valid-token>"
    Expected Result: {"email": "...", "name": "..."}
    Failure Indicators: 401, invalid payload
    Evidence: .omo/evidence/task-9-valid.json

  Scenario: Invalid token rejected
    Tool: Bash (curl)
    Preconditions: Worker running
    Steps:
      1. curl -X POST http://localhost:8787/validate -H "Authorization: Bearer invalid-token"
    Expected Result: 401 Unauthorized
    Failure Indicators: 200, no error
    Evidence: .omo/evidence/task-9-invalid.json
  ```

  **Evidence to Capture**:
  - [ ] task-9-valid.json
  - [ ] task-9-invalid.json

  **Commit**: YES
  - Message: `feat(auth): add JWT validation with jose library`
  - Files: `auth-worker/src/lib/jwt.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 10. **Domain Restriction (@ecampus.ut.ac.id)**

  **What to do**:
  - After successful OAuth callback, validate email domain:
    ```typescript
    async function validateEmailDomain(email: string): Promise<boolean> {
      const domain = email.split('@')[1];
      if (domain !== 'ecampus.ut.ac.id') {
        return false;
      }
      return true;
    }
    ```
  - If domain invalid:
    - Delete partial session from KV
    - Return error page/message: "Hanya email @ecampus.ut.ac.id yang diizinkan"
    - Log attempt in audit_log
  - If domain valid:
    - Check if user exists in D1 `users` table (by `entra_id`)
    - If not exists, create new user record
    - Log login in audit_log

  **Must NOT do**:
  - Allow generic error messages (leak domain validation exists)
  - Create user if domain is invalid

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `security`]
  - `typescript`: TypeScript throughout
  - `security`: Input validation patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2, with Tasks 8, 9, 11, 12)
  - **Blocks**: Tasks 13, 14
  - **Blocked By**: Tasks 2, 8, 9

  **References**:
  - `https://owasp.org/www-project-web-security-testing-guide/` - OWASP Input Validation

  **Acceptance Criteria**:
  - [ ] @ecampus.ut.ac.id login succeeds
  - [ ] @gmail.com login rejected with "Domain not allowed"
  - [ ] @ecampus.ut.ac.id new user created in D1
  - [ ] Failed login logged in audit_log

  **QA Scenarios**:

  ```
  Scenario: Valid domain login
    Tool: Bash (curl)
    Preconditions: Mock OAuth returns valid @ecampus email
    Steps:
      1. curl -X POST http://localhost:8787/auth/callback -d 'code=valid&state=valid&email=student@ecampus.ut.ac.id'
    Expected Result: Session created, user in D1
    Failure Indicators: Session not created, 403
    Evidence: .omo/evidence/task-10-valid.json

  Scenario: Invalid domain rejected
    Tool: Bash (curl)
    Preconditions: Mock OAuth returns invalid email
    Steps:
      1. curl -X POST http://localhost:8787/auth/callback -d 'code=valid&state=valid&email=hacker@gmail.com'
    Expected Result: 403 with "Domain not allowed" message
    Failure Indicators: 200, generic error, no audit log
    Evidence: .omo/evidence/task-10-invalid.json

  Scenario: Audit log entry created
    Tool: Bash (wrangler)
    Preconditions: Login attempted
    Steps:
      1. wrangler d1 execute AUTH_DB --command="SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 1"
    Expected Result: Entry with action='login_attempt', email matches
    Evidence: .omo/evidence/task-10-audit.json
  ```

  **Evidence to Capture**:
  - [ ] task-10-valid.json
  - [ ] task-10-invalid.json
  - [ ] task-10-audit.json

  **Commit**: YES
  - Message: `feat(auth): add @ecampus.ut.ac.id domain restriction`
  - Files: `auth-worker/src/lib/email-validator.ts`, updated `auth-worker/src/routes/auth.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 11. **Session Middleware + User Endpoint**

  **What to do**:
  - Create auth middleware (`src/middleware/auth.ts`):
    - Extract `__Host-session` cookie
    - Validate session from KV
    - Attach `c.set('session', session)` and `c.set('user', user)`
    - If session expired/missing, return 401
  - Create `/user/me` endpoint:
    - Returns current user profile from D1
    - Includes: id, email, display_name, role, created_at
  - Create `/user/session` endpoint:
    - Returns session info (no sensitive data)
    - Includes: expiresAt, createdAt

  **Must NOT do**:
  - Expose access/refresh tokens to client
  - Skip session validation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `hono`]
  - `hono`: Middleware patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2, with Tasks 8, 9, 10, 12)
  - **Blocks**: Tasks 13, 14
  - **Blocked By**: Tasks 6, 8, 9

  **References**:
  - `https://hono.dev/docs/middleware/builtin/cookie/` - Cookie middleware
  - `https://hono.dev/docs/middleware/builtin/bearer-auth/` - Auth middleware

  **Acceptance Criteria**:
  - [ ] `/user/me` returns user profile with valid session
  - [ ] `/user/me` returns 401 without valid session
  - [ ] Tokens not exposed in response
  - [ ] Expired session returns 401

  **QA Scenarios**:

  ```
  Scenario: Valid session returns user
    Tool: Bash (curl)
    Preconditions: Valid session cookie
    Steps:
      1. curl http://localhost:8787/user/me -b '__Host-session=valid-session-id'
    Expected Result: {"id":"...","email":"student@ecampus.ut.ac.id",...}
    Failure Indicators: 401, missing fields, tokens exposed
    Evidence: .omo/evidence/task-11-me.json

  Scenario: Invalid session returns 401
    Tool: Bash (curl)
    Preconditions: Invalid/expired session
    Steps:
      1. curl http://localhost:8787/user/me -b '__Host-session=invalid-id'
    Expected Result: 401 Unauthorized
    Failure Indicators: 200, partial data
    Evidence: .omo/evidence/task-11-401.json
  ```

  **Evidence to Capture**:
  - [ ] task-11-me.json
  - [ ] task-11-401.json

  **Commit**: YES
  - Message: `feat(auth): add session middleware and user endpoint`
  - Files: `auth-worker/src/middleware/auth.ts`, `auth-worker/src/routes/user.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 12. **Token Refresh Logic**

  **What to do**:
  - Implement refresh token flow:
    - Check if access token expired before API call
    - If expired, call `/auth/refresh` with refresh token
    - Exchange refresh token for new access token via `https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token`
    - Update session in KV with new tokens
    - If refresh token expired (90d), return 401 and redirect to login
  - Handle `AADSTS700084` error (refresh token expired):
    - Clear session
    - Return `{ error: 'session_expired', login_url: '/auth/login' }`
  - Add refresh logic to session middleware (transparent refresh)

  **Must NOT do**:
  - Loop infinitely on refresh failure
  - Use refresh token as access token

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `oauth`]
  - `oauth`: Token refresh patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2, with Tasks 8, 9, 10, 11)
  - **Blocks**: Tasks 13, 14
  - **Blocked By**: Tasks 6, 8

  **References**:
  - `https://learn.microsoft.com/en-us/entra/identity-platform/refresh-tokens` - Token lifetimes

  **Acceptance Criteria**:
  - [ ] Expired access token triggers refresh
  - [ ] New tokens stored in KV
  - [ ] Expired refresh token returns session_expired error
  - [ ] No infinite loops on refresh failure

  **QA Scenarios**:

  ```
  Scenario: Token refresh on expiry
    Tool: Bash (curl)
    Preconditions: Expired access token, valid refresh token
    Steps:
      1. curl http://localhost:8787/user/me -H "Authorization: Bearer expired-token" -b '__Host-session=test-session'
    Expected Result: Token refreshed, user data returned
    Failure Indicators: 401, infinite loop
    Evidence: .omo/evidence/task-12-refresh.json

  Scenario: Expired refresh token handled
    Tool: Bash (curl)
    Preconditions: Expired refresh token
    Steps:
      1. curl http://localhost:8787/auth/refresh -b '__Host-session=expired-session'
    Expected Result: 401 with session_expired error
    Failure Indicators: 200, infinite loop
    Evidence: .omo/evidence/task-12-expired.json
  ```

  **Evidence to Capture**:
  - [ ] task-12-refresh.json
  - [ ] task-12-expired.json

  **Commit**: YES
  - Message: `feat(auth): add token refresh logic with error handling`
  - Files: `auth-worker/src/routes/auth.ts`, `auth-worker/src/lib/microsoft.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 13. **Podcast Worker Scaffold**

  **What to do**:
  - Create `podcast-worker/` directory with `wrangler.toml`
  - Initialize Hono server with TypeScript
  - Configure D1 database (`PODCAST_DB`) binding
  - Configure R2 bucket (`AUDIO_BUCKET`) binding
  - Set up KV for cache (`PODCAST_CACHE`)
  - Environment variables: `AUTH_WORKER_URL`, `FRONTEND_URL`
  - Add CORS middleware

  **Must NOT do**:
  - Implement auth (delegate to auth-worker)
  - Store sessions locally

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `cloudflare-workers`, `hono`]
  - `typescript`: TypeScript throughout
  - `cloudflare-workers`: Worker deployment
  - `hono`: Router structure

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, with Tasks 14, 15, 16, 17, 18)
  - **Blocks**: Tasks 14, 15, 16, 17, 18
  - **Blocked By**: Tasks 1, 3

  **References**:
  - `https://hono.dev/` - Hono framework
  - `https://developers.cloudflare.com/r2/` - R2 binding

  **Acceptance Criteria**:
  - [ ] podcast-worker deploys to Cloudflare Workers
  - [ ] `/health` returns `{"status":"ok"}`
  - [ ] D1, R2, KV bindings accessible

  **QA Scenarios**:

  ```
  Scenario: Podcast Worker health
    Tool: Bash (curl)
    Preconditions: Worker deployed
    Steps:
      1. curl https://podcast-worker.workers.dev/health
    Expected Result: {"status":"ok"}
    Evidence: .omo/evidence/task-13-health.json
  ```

  **Evidence to Capture**:
  - [ ] task-13-health.json

  **Commit**: YES
  - Message: `feat(podcast): scaffold worker with D1, R2, KV bindings`
  - Files: `podcast-worker/`

---

- [ ] 14. **Podcast D1 Schema + Migrations**

  **What to do**:
  - Create D1 migration:
    ```sql
    CREATE TABLE podcasts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      description TEXT,
      cover_url TEXT,
      author TEXT,
      is_published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE episodes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      podcast_id TEXT NOT NULL REFERENCES podcasts(id),
      title TEXT NOT NULL,
      description TEXT,
      audio_url TEXT,
      audio_key TEXT,
      duration_seconds INTEGER,
      sequence INTEGER,
      is_published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE tags (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      slug TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE podcast_tags (
      podcast_id TEXT REFERENCES podcasts(id),
      tag_id TEXT REFERENCES tags(id),
      PRIMARY KEY (podcast_id, tag_id)
    );

    CREATE INDEX idx_episodes_podcast ON episodes(podcast_id);
    CREATE INDEX idx_tags_slug ON tags(slug);
    ```
  - Apply migrations via `wrangler d1 migrations apply PODCAST_DB`

  **Must NOT do**:
  - Add user_id column (podcasts are public)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`sql`, `cloudflare-workers`]
  - `sql`: D1 schema design

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, with Tasks 13, 15, 16, 17, 18)
  - **Blocks**: Tasks 15, 16
  - **Blocked By**: Task 13

  **References**:
  - `https://developers.cloudflare.com/d1/` - D1 docs

  **Acceptance Criteria**:
  - [ ] Migrations apply successfully
  - [ ] All tables created with correct schema
  - [ ] Indexes created

  **QA Scenarios**:

  ```
  Scenario: Migrations apply
    Tool: Bash (wrangler)
    Preconditions: D1 database exists
    Steps:
      1. wrangler d1 migrations apply PODCAST_DB --local
    Expected Result: Migration applied
    Evidence: .omo/evidence/task-14-migrations.json
  ```

  **Evidence to Capture**:
  - [ ] task-14-migrations.json

  **Commit**: YES
  - Message: `feat(podcast): add D1 schema for podcasts, episodes, tags`
  - Files: `podcast-worker/migrations/`

---

- [ ] 15. **Podcast CRUD API Endpoints**

  **What to do**:
  - Implement authenticated API endpoints:
    - `GET /api/podcasts` - List all published podcasts (public)
    - `GET /api/podcasts/:id` - Get podcast details (public)
    - `GET /api/episodes/:id` - Get episode details (public)
    - `POST /api/admin/podcasts` - Create podcast (admin only)
    - `PUT /api/admin/podcasts/:id` - Update podcast (admin only)
    - `DELETE /api/admin/podcasts/:id` - Delete podcast (admin only)
    - `POST /api/admin/episodes` - Create episode (admin only)
    - `PUT /api/admin/episodes/:id` - Update episode (admin only)
    - `DELETE /api/admin/episodes/:id` - Delete episode (admin only)
  - Admin check: call auth-worker `/user/me` with session cookie, verify `role=admin`
  - Validate request bodies with `zod`

  **Must NOT do**:
  - Expose admin endpoints without auth
  - Allow non-admin users to create/update/delete

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `hono`]
  - `hono`: Route handlers
  - `typescript`: TypeScript with Zod

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, with Tasks 13, 14, 16, 17, 18)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 13, 14

  **References**:
  - `https://hono.dev/` - Hono routing
  - `https://zod.dev/` - Schema validation

  **Acceptance Criteria**:
  - [ ] Public endpoints accessible without auth
  - [ ] Admin endpoints return 401 without valid session
  - [ ] Admin endpoints return 403 for non-admin users
  - [ ] CRUD operations work correctly

  **QA Scenarios**:

  ```
  Scenario: Public podcast list accessible
    Tool: Bash (curl)
    Preconditions: Podcasts exist
    Steps:
      1. curl https://podcast-worker.workers.dev/api/podcasts
    Expected Result: Array of published podcasts
    Failure Indicators: 401, 500
    Evidence: .omo/evidence/task-15-public.json

  Scenario: Admin endpoint protected
    Tool: Bash (curl)
    Preconditions: No session
    Steps:
      1. curl -X POST https://podcast-worker.workers.dev/api/admin/podcasts -d '{"title":"Test"}'
    Expected Result: 401 Unauthorized
    Failure Indicators: 200, accepts request
    Evidence: .omo/evidence/task-15-admin-protected.json

  Scenario: Admin can create podcast
    Tool: Bash (curl)
    Preconditions: Admin session
    Steps:
      1. curl -X POST https://podcast-worker.workers.dev/api/admin/podcasts -b '__Host-session=admin-session' -d '{"title":"Test Podcast"}'
    Expected Result: 201 Created with podcast object
    Failure Indicators: 401, 403, 500
    Evidence: .omo/evidence/task-15-create.json
  ```

  **Evidence to Capture**:
  - [ ] task-15-public.json
  - [ ] task-15-admin-protected.json
  - [ ] task-15-create.json

  **Commit**: YES
  - Message: `feat(podcast): add CRUD API endpoints`
  - Files: `podcast-worker/src/routes/`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 16. **R2 Audio Upload + Streaming**

  **What to do**:
  - Implement audio upload endpoint (`POST /api/admin/episodes/:id/audio`):
    - Accept multipart form data (audio file)
    - Validate file type (m4a, mp3, wav, max 100MB)
    - Generate unique key: `podcasts/{podcastId}/{episodeId}/{filename}`
    - Upload to R2 bucket
    - Update episode record with `audio_url` and `audio_key`
    - FFmpeg validation: verify audio integrity (optional enhancement)
  - Implement audio streaming endpoint (`GET /api/audio/:key`):
    - Redirect to signed R2 URL (1h expiry)
    - Support Range requests for seeking
  - Implement audio cache for offline:
    - When episode played online, trigger background cache
    - Store in IndexedDB with expiration

  **Must NOT do**:
  - Serve audio directly from R2 (use signed URLs)
  - Allow uploads without admin auth

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `cloudflare-workers`]
  - `cloudflare-workers`: R2 operations

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, with Tasks 13, 14, 15, 17, 18)
  - **Blocks**: Task 17
  - **Blocked By**: Task 13

  **References**:
  - `https://developers.cloudflare.com/r2/data-access/workers-api/api/` - R2 API
  - `https://developers.cloudflare.com/r2/data-access/signed-urls/` - Signed URLs

  **Acceptance Criteria**:
  - [ ] Audio file uploads to R2 successfully
  - [ ] Signed URL generated for playback
  - [ ] Range requests work for seeking
  - [ ] Episode `audio_url` updated in D1

  **QA Scenarios**:

  ```
  Scenario: Upload audio to R2
    Tool: Bash (curl)
    Preconditions: Admin session, valid audio file
    Steps:
      1. curl -X POST https://podcast-worker.workers.dev/api/admin/episodes/test-id/audio -F "audio=@test.m4a"
    Expected Result: 200 with {"audio_url": "..."}
    Failure Indicators: 400, 500, no file in R2
    Evidence: .omo/evidence/task-16-upload.json

  Scenario: Audio streaming with signed URL
    Tool: Bash (curl)
    Preconditions: Audio uploaded
    Steps:
      1. curl -I https://podcast-worker.workers.dev/api/audio/test-key
    Expected Result: 302 redirect to signed R2 URL
    Failure Indicators: 404, no redirect
    Evidence: .omo/evidence/task-16-stream.json
  ```

  **Evidence to Capture**:
  - [ ] task-16-upload.json
  - [ ] task-16-stream.json

  **Commit**: YES
  - Message: `feat(podcast): add R2 audio upload and streaming`
  - Files: `podcast-worker/src/routes/audio.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 17. **Backoffice Admin UI**

  **What to do**:
  - Create admin pages in `frontend/`:
    - `/admin` - Dashboard with podcast list
    - `/admin/podcasts/new` - Create podcast form
    - `/admin/podcasts/:id` - Edit podcast
    - `/admin/podcasts/:id/episodes/new` - Add episode
    - `/admin/episodes/:id` - Edit episode
    - `/admin/tags` - Tag management
  - Implement auth flow:
    - Redirect to auth-worker for login
    - Store session cookie
    - Check admin role from `/user/me`
  - Implement API client for podcast-worker:
    - `GET /api/podcasts`, `POST /api/admin/podcasts`, etc.
    - Include session cookie in requests
  - UI: Use Tailwind CSS, responsive design

  **Must NOT do**:
  - Hardcode API URLs
  - Store tokens in localStorage

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`typescript`, `next-js`, `tailwindcss`]
  - `next-js`: App Router pages
  - `tailwindcss`: Styling

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, with Tasks 13, 14, 15, 16, 18)
  - **Blocks**: Task 18
  - **Blocked By**: Tasks 3, 15

  **References**:
  - `https://github.com/krismyid/temantuton-podcast/blob/master/css/style.css` - Existing styling
  - `https://nextjs.org/docs/app` - Next.js pages

  **Acceptance Criteria**:
  - [ ] Admin pages accessible only to admin users
  - [ ] Non-admin users redirected to home
  - [ ] CRUD operations work from UI
  - [ ] Responsive on mobile

  **QA Scenarios**:

  ```
  Scenario: Admin dashboard loads
    Tool: Playwright
    Preconditions: Admin logged in
    Steps:
      1. page.goto('http://localhost:3000/admin')
      2. page.waitForSelector('h1:has-text("Dashboard")')
    Expected Result: Dashboard page loads with podcast list
    Failure Indicators: 401 redirect, blank page
    Evidence: .omo/evidence/task-17-dashboard.png

  Scenario: Create podcast from UI
    Tool: Playwright
    Preconditions: Admin logged in
    Steps:
      1. page.goto('http://localhost:3000/admin/podcasts/new')
      2. page.fill('input[name="title"]', 'Test Podcast')
      3. page.click('button[type="submit"]')
    Expected Result: Podcast created, redirect to edit page
    Failure Indicators: Form error, no redirect
    Evidence: .omo/evidence/task-17-create.png
  ```

  **Evidence to Capture**:
  - [ ] task-17-dashboard.png
  - [ ] task-17-create.png

  **Commit**: YES
  - Message: `feat(podcast): add backoffice admin UI`
  - Files: `frontend/app/admin/`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 18. **Podcast Player UI + PWA Audio Cache**

  **What to do**:
  - Create podcast player component:
    - Audio player with play/pause, seek, volume
    - Episode progress tracking
    - Mark as completed
  - Implement PWA audio cache:
    - Service worker intercepts audio requests
    - Cache audio file when played online
    - Check cache first on subsequent plays
    - Implement 256MB cache limit:
      - Track total cache size
      - LRU eviction when limit reached
      - Show user notification when cache cleared
  - Migrate from existing demo patterns:
    - `PODCAST_DATA` structure (series.json)
    - IndexedDB for progress (adapt from `app.js`)

  **Must NOT do**:
  - Cache all episodes automatically (cache on play only)
  - Exceed 256MB limit

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`typescript`, `next-js`, `pwa`]
  - `pwa`: Service worker, cache management

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, with Tasks 13, 14, 15, 16, 17)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 15

  **References**:
  - `https://github.com/krismyid/temantuton-podcast/blob/master/js/app.js` - Existing player logic
  - `https://developer.chrome.com/docs/workbox/` - Workbox cache strategies

  **Acceptance Criteria**:
  - [ ] Audio plays with player controls
  - [ ] Audio cached after first play
  - [ ] Cached audio plays offline
  - [ ] 256MB cache limit enforced
  - [ ] Progress tracked across sessions

  **QA Scenarios**:

  ```
  Scenario: Audio plays online
    Tool: Playwright
    Preconditions: Episode exists
    Steps:
      1. page.goto('http://localhost:3000/podcast/test-id')
      2. page.click('.play-button')
      3. page.waitForTimeout(3000)
      4. expect(page.locator('.play-button')).toHaveClass(/playing/)
    Expected Result: Audio plays, button shows playing state
    Failure Indicators: Audio doesn't load, button doesn't update
    Evidence: .omo/evidence/task-18-online.png

  Scenario: Audio plays offline (cached)
    Tool: Playwright
    Preconditions: Audio cached previously
    Steps:
      1. Go offline (disable network)
      2. page.goto('http://localhost:3000/podcast/test-id')
      3. page.click('.play-button')
    Expected Result: Cached audio plays offline
    Failure Indicators: Network error, audio doesn't play
    Evidence: .omo/evidence/task-18-offline.png

  Scenario: Cache limit enforced
    Tool: Bash (JS)
    Preconditions: 256MB cache filled
    Steps:
      1. Estimate cache size
      2. Trigger new cache write
    Expected Result: Oldest entry evicted, new entry cached
    Failure Indicators: Exceeds 256MB, no eviction
    Evidence: .omo/evidence/task-18-cache-limit.json
  ```

  **Evidence to Capture**:
  - [ ] task-18-online.png
  - [ ] task-18-offline.png
  - [ ] task-18-cache-limit.json

  **Commit**: YES
  - Message: `feat(podcast): add player UI and PWA audio cache`
  - Files: `frontend/components/PodcastPlayer.tsx`, `frontend/app/podcast/[id]/`, `frontend/public/sw.js`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 19. **langflow Webhook API**

  **What to do**:
  - Implement webhook endpoint: `POST /api/webhook/langflow`
  - Validate webhook signature (if langflow provides one)
  - Process incoming payload:
    ```json
    {
      "episode_id": "...",
      "status": "processing|completed|failed",
      "audio_url": "...",
      "error": "..."
    }
    ```
  - Update episode status in D1
  - If `status=completed`, trigger podcast cache invalidation
  - Implement retry logic (3 retries with exponential backoff)
  - Return 200 immediately (async processing)

  **Must NOT do**:
  - Wait for processing to complete (async)
  - Expose internal errors to langflow

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `hono`]
  - `hono`: Route handlers

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocks**: None
  - **Blocked By**: Task 15

  **References**:
  - None (simple webhook pattern)

  **Acceptance Criteria**:
  - [ ] Webhook accepts POST with payload
  - [ ] Episode status updated in D1
  - [ ] Returns 200 quickly
  - [ ] Retry logic works on failure

  **QA Scenarios**:

  ```
  Scenario: Webhook updates episode
    Tool: Bash (curl)
    Preconditions: Episode exists
    Steps:
      1. curl -X POST https://podcast-worker.workers.dev/api/webhook/langflow -d '{"episode_id":"test-id","status":"completed"}'
    Expected Result: 200, episode status updated
    Failure Indicators: 500, status not updated
    Evidence: .omo/evidence/task-19-webhook.json
  ```

  **Evidence to Capture**:
  - [ ] task-19-webhook.json

  **Commit**: YES
  - Message: `feat(podcast): add langflow webhook endpoint`
  - Files: `podcast-worker/src/routes/webhook.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 20. **Dojo Worker Scaffold**

  **What to do**:
  - Create `dojo-worker/` directory with `wrangler.toml`
  - Initialize Hono server with TypeScript
  - Configure D1 database (`DOJO_DB`) binding
  - Configure R2 bucket (`DOJO_BUCKET`) binding
  - Set up KV for cache (`DOJO_CACHE`)
  - Environment variables: `AUTH_WORKER_URL`, `FRONTEND_URL`, `LLM_API_URL`, `LLM_API_KEY`
  - Add CORS middleware

  **Must NOT do**:
  - Implement auth (delegate to auth-worker)
  - Call LLM directly from frontend

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `cloudflare-workers`]
  - `cloudflare-workers`: Worker deployment

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, with Tasks 21, 22, 23, 24, 25)
  - **Blocks**: Tasks 21, 22, 23, 24, 25
  - **Blocked By**: Task 1

  **References**:
  - None (similar to podcast-worker scaffold)

  **Acceptance Criteria**:
  - [ ] dojo-worker deploys successfully
  - [ ] `/health` returns `{"status":"ok"}`
  - [ ] D1, R2, KV bindings accessible

  **QA Scenarios**:

  ```
  Scenario: Dojo Worker health
    Tool: Bash (curl)
    Preconditions: Worker deployed
    Steps:
      1. curl https://dojo-worker.workers.dev/health
    Expected Result: {"status":"ok"}
    Evidence: .omo/evidence/task-20-health.json
  ```

  **Evidence to Capture**:
  - [ ] task-20-health.json

  **Commit**: YES
  - Message: `feat(dojo): scaffold worker with D1, R2, KV bindings`
  - Files: `dojo-worker/`

---

- [ ] 21. **Dojo D1 Schema + Migrations**

  **What to do**:
  - Create D1 migrations:
    ```sql
    CREATE TABLE subjects (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      source_pdf_key TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE questions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      subject_id TEXT REFERENCES subjects(id),
      question_text TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'single',  -- 'single' or 'combination'
      options TEXT NOT NULL,  -- JSON array for single, array of statements for combination
      correct_answer TEXT NOT NULL,  -- 'A','B','C','D' for single; 'A','B','C','D' for combination
      explanation TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      source_section TEXT,
      source_page TEXT,  -- UT module page (e.g., "1.12", "2.5") from HALAMAN marker
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE user_progress (
      user_id TEXT NOT NULL,
      question_id TEXT REFERENCES questions(id),
      is_correct INTEGER,
      answered_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, question_id)
    );

    CREATE TABLE xp_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      criteria TEXT NOT NULL
    );

    CREATE TABLE user_badges (
      user_id TEXT NOT NULL,
      badge_id TEXT REFERENCES badges(id),
      earned_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, badge_id)
    );

    CREATE TABLE streaks (
      user_id TEXT PRIMARY KEY,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_activity_date TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX idx_questions_subject ON questions(subject_id);
    CREATE INDEX idx_progress_user ON user_progress(user_id);
    CREATE INDEX idx_xp_log_user ON xp_log(user_id, created_at DESC);
    CREATE INDEX idx_badges_criteria ON badges(criteria);
    ```
  - Seed initial badges

  **Must NOT do**:
  - Expose correct_answer to client in non-admin views

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`sql`, `cloudflare-workers`]
  - `sql`: Schema design

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, with Tasks 20, 22, 23, 24, 25)
  - **Blocks**: Tasks 22, 23
  - **Blocked By**: Task 20

  **References**:
  - None (schema design)

  **Acceptance Criteria**:
  - [ ] Migrations apply successfully
  - [ ] Badges seeded
  - [ ] All indexes created

  **QA Scenarios**:

  ```
  Scenario: Migrations apply
    Tool: Bash (wrangler)
    Preconditions: D1 database exists
    Steps:
      1. wrangler d1 migrations apply DOJO_DB --local
    Expected Result: Migration applied
    Evidence: .omo/evidence/task-21-migrations.json

  Scenario: Badges seeded
    Tool: Bash (wrangler)
    Preconditions: Migrations applied
    Steps:
      1. wrangler d1 execute DOJO_DB --command="SELECT * FROM badges"
    Expected Result: At least 5 badges
    Evidence: .omo/evidence/task-21-badges.json
  ```

  **Evidence to Capture**:
  - [ ] task-21-migrations.json
  - [ ] task-21-badges.json

  **Commit**: YES
  - Message: `feat(dojo): add D1 schema for questions, gamification`
  - Files: `dojo-worker/migrations/`

---

- [ ] 22. **PDF Upload + OpenDataLoader Pipeline**

  **What to do**:
  - Implement PDF upload endpoint: `POST /api/admin/subjects`
    - Accept PDF file
    - Store in R2 bucket: `pdfs/{subjectId}/{filename}.pdf`
    - Create subject record in D1 with status='pending'
    - Queue processing job
  - Implement processing pipeline:
    - Use `pdf-parse` or `opendataloader` to extract text
    - **CRITICAL**: Preserve module-relative page numbers (UT format: X.Y)
      - Each page has footer with module/page indicator (e.g., "1.3", "1.12", "2.5")
      - Extract page number from footer/text, insert as metadata marker
      - Format: `<!-- HALAMAN 1.12 -->`
      - Example:
        ```markdown
        <!-- HALAMAN 1.1 -->
        # Pengertian Hukum Dagang dan Kepailitan

        Hukum adalah...

        <!-- HALAMAN 1.12 -->
        ## Latihan

        1. Apa yang dimaksud dengan...
        ```
    - **Extract FULL module content** (all sections, not just latihan)
    - Convert to Markdown format
    - Save full Markdown to R2: `markdown/{subjectId}/{filename}.md`
    - Update subject status='ready_for_llm'
  - Implement `POST /api/admin/subjects/:id/process` endpoint:
    - Manually trigger processing
    - Return job status
  - Implement progress tracking:
    - Store processing status in subject record
    - Support webhooks for completion notification

  **Must NOT do**:
  - Process PDFs synchronously (use async)
  - Store full PDF long-term (delete after processing)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `pdf-processing`]
  - `typescript`: Pipeline implementation
  - `pdf-processing`: PDF text extraction

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, with Tasks 20, 21, 23, 24, 25)
  - **Blocks**: Task 23
  - **Blocked By**: Task 20

  **References**:
  - None (standard PDF pipeline)

  **Acceptance Criteria**:
  - [ ] PDF uploads to R2
  - [ ] Text extracted and converted to Markdown
  - [ ] **Page numbers preserved as `<!-- HALAMAN X.Y -->` markers (UT module format)**
  - [ ] Subject status updated correctly
  - [ ] Markdown stored in R2

  **QA Scenarios**:

  ```
  Scenario: PDF upload creates subject
    Tool: Bash (curl)
    Preconditions: Admin session
    Steps:
      1. curl -X POST https://dojo-worker.workers.dev/api/admin/subjects -F "name=Hukum Adat" -F "pdf=@test.pdf"
    Expected Result: 201, subject created with status=pending
    Evidence: .omo/evidence/task-22-upload.json

  Scenario: Processing extracts text
    Tool: Bash (curl)
    Preconditions: Subject created
    Steps:
      1. curl -X POST https://dojo-worker.workers.dev/api/admin/subjects/test-id/process
    Expected Result: Subject status changes to ready_for_llm
    Evidence: .omo/evidence/task-22-process.json
  ```

  **Evidence to Capture**:
  - [ ] task-22-upload.json
  - [ ] task-22-process.json

  **Commit**: YES
  - Message: `feat(dojo): add PDF upload and OpenDataLoader pipeline`
  - Files: `dojo-worker/src/routes/subjects.ts`, `dojo-worker/src/lib/pdf-processor.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 23. **databyte-m1 LLM Integration**

  **What to do**:
  - Implement question generation endpoint: `POST /api/admin/subjects/:id/generate`
  - Load Markdown content from R2
  - Extract "latihan soal" section:
    - Use regex or LLM to identify section
    - If no section found, return error with guidance
  - Generate questions using databyte-m1:
    - **CRITICAL**: LLM needs FULL markdown content for context (not just latihan soal)
    - **CRITICAL**: Preserve page references from markdown (marked with `<!-- HALAMAN X.Y -->`)
    - Prompt template:
      ```
      Kamu adalah guru yang membuat soal latihan untuk mahasiswa.

      LANGKAH:
      1. Baca SELURUH konten modul (semua section, bukan hanya latihan)
      2. Identifikasi section "Latihan", "Latihan Soal", atau soal-soal yang ada
      3. Buat pertanyaan baru BERDASARKAN materi dari section tersebut
      4. Tulis penjelasan yang merujuk ke halaman spesifik: "Jawaban A karena... (halaman: 1.12)"

      FORMAT OUTPUT JSON:
      {
        "questions": [
          {
            "question": "Pertanyaan dalam Bahasa Indonesia...",
            "type": "single",
            "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
            "correct_answer": "A",
            "explanation": "Penjelasan singkat... (halaman: 1.12)",
            "difficulty": "medium",
            "source_page": "1.12"
          },
          {
            "question": "Pertanyaan dalam Bahasa Indonesia...",
            "type": "combination",
            "statements": [
              "1) Pernyataan pertama...",
              "2) Pernyataan kedua...",
              "3) Pernyataan ketiga..."
            ],
            "options": [
              "A. JIKA 1) DAN 2) BENAR",
              "B. JIKA 1) DAN 3) BENAR",
              "C. JIKA 2) DAN 3) BENAR",
              "D. JIKA 1),2),DAN 3) SEMUANYA BENAR"
            ],
            "correct_answer": "B",
            "explanation": "Jawaban B benar karena... (halaman: 1.12)",
            "difficulty": "medium",
            "source_page": "1.12"
          }
        ]
      }

      TIPE SOAL:
      - type="single": PILIH SALAH SATU (A, B, C, D) - pertanyaan biasa
      - type="combination": PILIH KOMBINASI (A, B, C, D) - soal型式 tentang 3 pernyataan

      CATATAN:
      - Penjelasan MAKSIMAL 250 kata
      - Langsung ke inti, tidak berbelit-belit
      - Campurkan type="single" dan type="combination" di setiap kuis

      SEMUA KONTEN MODUL:
      {full_markdown_content}
      ```
    - **IMPORTANT**: Load and send full markdown content to LLM (all sections for context)
    - **IMPORTANT**: Mix both question types (single + combination) in each quiz
    - LLM should understand full material before generating questions from latihan section
    - Parse LLM response as JSON
    - Validate response format (must have `source_page` for each question)
    - Save questions to D1 (include `source_page` column, `type` field)
    - Update subject status='completed'
  - Implement retry logic (3 attempts on failure)
  - Source attribution:
    - Store `source_pdf_key` in question record
    - Include attribution in explanations

  **Must NOT do**:
  - Call LLM from frontend (security)
  - Expose API key to client

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`, `llm`]
  - `typescript`: API integration
  - `llm`: databyte-m1 integration

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, with Tasks 20, 21, 22, 24, 25)
  - **Blocks**: Task 24
  - **Blocked By**: Tasks 21, 22

  **References**:
  - databyte-m1 API docs (user to provide)

  **Acceptance Criteria**:
  - [ ] Questions generated from Markdown
  - [ ] Questions in Bahasa Indonesia
  - [ ] **Both question types generated: type="single" AND type="combination"**
  - [ ] Correct JSON format
  - [ ] Questions saved to D1 with type field
  - [ ] Source attribution included
  - [ ] Page references in explanations

  **QA Scenarios**:

  ```
  Scenario: Generate questions from Markdown
    Tool: Bash (curl)
    Preconditions: Subject with Markdown ready
    Steps:
      1. curl -X POST https://dojo-worker.workers.dev/api/admin/subjects/test-id/generate
    Expected Result: Questions created in D1
    Evidence: .omo/evidence/task-23-generate.json

  Scenario: Both question types present
    Tool: Bash (wrangler)
    Preconditions: Questions generated
    Steps:
      1. wrangler d1 execute DOJO_DB --command="SELECT type, COUNT(*) as count FROM questions GROUP BY type"
    Expected Result: Both 'single' and 'combination' types present
    Failure Indicators: Only one type generated
    Evidence: .omo/evidence/task-23-types.json

  Scenario: Combination question has 3 statements
    Tool: Bash (wrangler)
    Preconditions: Questions with type='combination'
    Steps:
      1. wrangler d1 execute DOJO_DB --command="SELECT options FROM questions WHERE type='combination' LIMIT 1"
    Expected Result: Options contains 3 statements (1), 2), 3))
    Evidence: .omo/evidence/task-23-combination.json

  Scenario: Questions in Bahasa Indonesia
    Tool: Bash (curl)
    Preconditions: Questions generated
    Steps:
      1. wrangler d1 execute DOJO_DB --command="SELECT question_text FROM questions LIMIT 1"
    Expected Result: Question text contains Indonesian characters, no English
    Evidence: .omo/evidence/task-23-language.json

  Scenario: Questions include page references
    Tool: Bash (curl)
    Preconditions: Questions generated
    Steps:
      1. wrangler d1 execute DOJO_DB --command="SELECT explanation, source_page FROM questions"
    Expected Result: Every explanation contains "(halaman: X.Y)" and source_page matches pattern like "1.12"
    Failure Indicators: Missing "(halaman: X.Y)", NULL source_page, wrong format
    Evidence: .omo/evidence/task-23-page-ref.json
  ```

  **Evidence to Capture**:
  - [ ] task-23-generate.json
  - [ ] task-23-types.json
  - [ ] task-23-combination.json
  - [ ] task-23-language.json
  - [ ] task-23-page-ref.json

  **Commit**: YES
  - Message: `feat(dojo): add databyte-m1 LLM question generation`
  - Files: `dojo-worker/src/lib/llm-client.ts`, `dojo-worker/src/routes/subjects.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 24. **Gamification Engine (XP, Badges, Streaks)**

  **What to do**:
  - Implement XP system:
    - Correct answer: +10 XP
    - Streak bonus: +5 XP per streak day
    - First correct of day: +5 XP bonus
    - Log all XP changes to `xp_log` table
  - Implement badge system:
    - Check badge criteria on each answer:
      - "First Steps": Complete first question
      - "On Fire": 7-day streak
      - "Scholar": Answer 100 questions
      - "Perfect Score": 10 correct in a row
      - "Night Owl": Study after 10 PM
    - Award badge in `user_badges` table
    - Return newly earned badges in response
  - Implement streak tracking:
    - On activity, update `last_activity_date`
    - If same day, no change
    - If next day, increment `current_streak`
    - If gap > 1 day, reset `current_streak` to 1
    - Update `longest_streak` if current exceeds
  - Implement `/api/dojo/progress` endpoint:
    - Return: total XP, current level, badges, current streak, longest streak
    - Calculate level from XP (level = floor(sqrt(XP / 100)))

  **Must NOT do**:
  - Award XP for incorrect answers (except streak bonuses)
  - Allow badge farming

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`typescript`]
  - `typescript`: Game logic

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, with Tasks 20, 21, 22, 23, 25)
  - **Blocks**: Task 25
  - **Blocked By**: Task 21

  **References**:
  - None (custom gamification logic)

  **Acceptance Criteria**:
  - [ ] XP awarded for correct answers
  - [ ] Badges awarded when criteria met
  - [ ] Streaks tracked correctly
  - [ ] Progress endpoint returns all data

  **QA Scenarios**:

  ```
  Scenario: XP awarded for correct answer
    Tool: Bash (curl)
    Preconditions: User answered question
    Steps:
      1. curl -X POST https://dojo-worker.workers.dev/api/dojo/answer -b '__Host-session=user-session' -d '{"question_id":"q1","answer":"A"}'
    Expected Result: XP increased, xp_log entry created
    Evidence: .omo/evidence/task-24-xp.json

  Scenario: Badge awarded on criteria
    Tool: Bash (curl)
    Preconditions: User meets badge criteria
    Steps:
      1. curl https://dojo-worker.workers.dev/api/dojo/progress -b '__Host-session=user-session'
    Expected Result: New badge in badges array
    Evidence: .omo/evidence/task-24-badge.json

  Scenario: Streak incremented
    Tool: Bash (wrangler)
    Preconditions: User answered yesterday
    Steps:
      1. curl -X POST https://dojo-worker.workers.dev/api/dojo/answer -b '__Host-session=user-session' -d '{"question_id":"q1","answer":"A"}'
      2. wrangler d1 execute DOJO_DB --command="SELECT current_streak FROM streaks WHERE user_id='test-user'"
    Expected Result: current_streak incremented
    Evidence: .omo/evidence/task-24-streak.json
  ```

  **Evidence to Capture**:
  - [ ] task-24-xp.json
  - [ ] task-24-badge.json
  - [ ] task-24-streak.json

  **Commit**: YES
  - Message: `feat(dojo): add gamification engine (XP, badges, streaks)`
  - Files: `dojo-worker/src/lib/gamification.ts`, `dojo-worker/src/routes/dojo.ts`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 25. **Leaderboard Endpoint**

  **What to do**:
  - Implement `/api/dojo/leaderboard` endpoint:
    - Return top 100 users by total XP
    - Include: rank, user_id (or display_name), total_xp, current_level, streak
    - Cache in KV for 5 minutes (reduce DB load)
  - Implement `/api/dojo/rank` endpoint:
    - Return current user's rank
    - Return users around them (rank - 5 to rank + 5)
  - Leaderboard UI:
    - Create `/dojo/leaderboard` page
    - Show top 10 highlighted
    - Show current user highlighted in context
    - Refresh every 30 seconds
  - Pagination: `/api/dojo/leaderboard?page=2&limit=10`

  **Must NOT do**:
  - Show anonymous users (must have display_name)
  - Cache leaderboard for too long (stale data)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`]
  - `typescript`: API implementation

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, with Tasks 20, 21, 22, 23, 24)
  - **Blocks**: None
  - **Blocked By**: Task 24

  **References**:
  - None (standard leaderboard pattern)

  **Acceptance Criteria**:
  - [ ] Leaderboard returns top 100 users
  - [ ] User rank endpoint works
  - [ ] KV cache working
  - [ ] Leaderboard page renders correctly

  **QA Scenarios**:

  ```
  Scenario: Leaderboard returns users
    Tool: Bash (curl)
    Preconditions: Users with XP
    Steps:
      1. curl https://dojo-worker.workers.dev/api/dojo/leaderboard
    Expected Result: Array of users with rank, name, XP
    Failure Indicators: Empty array, missing fields
    Evidence: .omo/evidence/task-25-leaderboard.json

  Scenario: User rank endpoint
    Tool: Bash (curl)
    Preconditions: User session
    Steps:
      1. curl https://dojo-worker.workers.dev/api/dojo/rank -b '__Host-session=user-session'
    Expected Result: User rank and surrounding users
    Evidence: .omo/evidence/task-25-rank.json
  ```

  **Evidence to Capture**:
  - [ ] task-25-leaderboard.json
  - [ ] task-25-rank.json

  **Commit**: YES
  - Message: `feat(dojo): add leaderboard endpoint and UI`
  - Files: `dojo-worker/src/routes/leaderboard.ts`, `frontend/app/dojo/leaderboard/`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 26. **Dojo UI + Offline Mode**

  **What to do**:
  - Create Dojo pages:
    - `/dojo` - Subject list
    - `/dojo/[subjectId]` - Question list
    - `/dojo/[subjectId]/practice` - Practice mode
    - `/dojo/[subjectId]/quiz` - Timed quiz mode
  - Implement practice mode:
    - Show one question at a time
    - Reveal answer + explanation after selection
    - Track progress (correct/incorrect)
  - Implement quiz mode:
    - Timed (configurable: 10, 20, 30 minutes)
    - Randomize question order
    - No reveal until quiz complete
  - Implement offline mode:
    - Service worker caches questions on first load
    - Store answers in IndexedDB when offline
    - Sync to server when back online
    - Handle conflicts: server wins, log conflicts
  - Integrate gamification:
    - Show XP earned after each answer
    - Badge notification popup
    - Streak indicator

  **Must NOT do**:
  - Show correct answer in offline mode before submission
  - Cache questions permanently (refresh on reconnect)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`typescript`, `next-js`, `pwa`]
  - `pwa`: Service worker, offline sync

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocks**: None
  - **Blocked By**: Tasks 20, 21, 24

  **References**:
  - None (custom Dojo UI)

  **Acceptance Criteria**:
  - [ ] Practice mode works
  - [ ] Quiz mode works
  - [ ] Questions cached for offline
  - [ ] Offline answers sync on reconnect
  - [ ] XP, badges, streaks displayed

  **QA Scenarios**:

  ```
  Scenario: Practice mode
    Tool: Playwright
    Preconditions: Questions available
    Steps:
      1. page.goto('http://localhost:3000/dojo/test-subject/practice')
      2. page.waitForSelector('.question-text')
      3. page.click('.option-a')
      4. page.waitForSelector('.explanation')
    Expected Result: Explanation shown after answer
    Failure Indicators: No explanation, crash
    Evidence: .omo/evidence/task-26-practice.png

  Scenario: Offline practice
    Tool: Playwright
    Preconditions: Questions cached, go offline
    Steps:
      1. page.goto('http://localhost:3000/dojo/test-subject/practice')
      2. Go offline (disable network)
      3. Answer question
    Expected Result: Question answers saved locally
    Failure Indicators: Network error shown
    Evidence: .omo/evidence/task-26-offline.png
  ```

  **Evidence to Capture**:
  - [ ] task-26-practice.png
  - [ ] task-26-offline.png

  **Commit**: YES
  - Message: `feat(dojo): add Dojo UI with offline mode`
  - Files: `frontend/app/dojo/`, `frontend/components/Dojo*.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 27. **Frontend Auth Integration**

  **What to do**:
  - Create auth context (`AuthContext`):
    - Store: user, session, isLoading
    - Methods: login(), logout(), refreshSession()
  - Create login page (`/login`):
    - Redirect to auth-worker OAuth flow
    - Handle callback URL
  - Create logout functionality:
    - Call auth-worker `/auth/logout`
    - Clear local state
  - Create auth-protected route wrapper:
    - Check session on mount
    - Redirect to login if no session
    - Support return URL
  - Integrate with all protected pages:
    - `/admin/*`
    - `/dojo/*`
    - `/profile`
  - Create profile page:
    - Show user info from `/user/me`
    - Show gamification stats

  **Must NOT do**:
  - Store tokens in localStorage
  - Bypass auth checks

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`typescript`, `next-js`]
  - `next-js`: React context, pages

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 11

  **References**:
  - None (standard auth integration)

  **Acceptance Criteria**:
  - [ ] Login redirects to Microsoft
  - [ ] Protected pages redirect to login if unauthenticated
  - [ ] Logout clears session
  - [ ] Profile page shows user info

  **QA Scenarios**:

  ```
  Scenario: Login redirects to Microsoft
    Tool: Playwright
    Preconditions: None
    Steps:
      1. page.goto('http://localhost:3000/login')
    Expected Result: Redirect to Microsoft login
    Failure Indicators: 404, no redirect
    Evidence: .omo/evidence/task-27-login.json

  Scenario: Protected page redirects
    Tool: Playwright
    Preconditions: No session
    Steps:
      1. page.goto('http://localhost:3000/dojo')
    Expected Result: Redirect to /login
    Failure Indicators: Page loads, 500
    Evidence: .omo/evidence/task-27-protected.png
  ```

  **Evidence to Capture**:
  - [ ] task-27-login.json
  - [ ] task-27-protected.png

  **Commit**: YES
  - Message: `feat(frontend): add auth integration and protected routes`
  - Files: `frontend/contexts/AuthContext.tsx`, `frontend/app/login/`, `frontend/components/ProtectedRoute.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

- [ ] 28. **Home Dashboard + Navigation**

  **What to do**:
  - Create home page (`/`):
    - Welcome message with user name
    - Quick links: Podcast, Dojo
    - Recent activity: last played podcast, dojo stats
  - Create navigation:
    - Header with logo, nav links, user menu
    - Mobile hamburger menu
    - Bottom navigation on mobile (Home, Podcast, Dojo, Profile)
  - Create footer:
    - App name, version
    - Links: About, Privacy, Terms
    - "Unofficial app for UT students"
  - Implement theme:
    - Dark mode default (like existing podcast demo)
    - Light mode toggle
    - CSS variables for theming

  **Must NOT do**:
  - Hardcode routes
  - Use Bootstrap or generic UI

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`typescript`, `next-js`, `tailwindcss`]
  - `tailwindcss`: Layout and styling

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:
  - `https://github.com/krismyid/temantuton-podcast/blob/master/css/style.css` - Existing styling

  **Acceptance Criteria**:
  - [ ] Home page loads with user welcome
  - [ ] Navigation works on mobile and desktop
  - [ ] Theme toggle works
  - [ ] Footer displays correctly

  **QA Scenarios**:

  ```
  Scenario: Home page loads
    Tool: Playwright
    Preconditions: User logged in
    Steps:
      1. page.goto('http://localhost:3000/')
      2. page.waitForSelector('text=Selamat datang')
    Expected Result: Welcome message with user name
    Failure Indicators: 404, blank page
    Evidence: .omo/evidence/task-28-home.png

  Scenario: Mobile navigation
    Tool: Playwright (mobile viewport)
    Preconditions: Mobile viewport
    Steps:
      1. page.goto('http://localhost:3000/')
      2. Check bottom navigation visible
    Expected Result: Bottom nav with Home, Podcast, Dojo, Profile
    Evidence: .omo/evidence/task-28-mobile.png
  ```

  **Evidence to Capture**:
  - [ ] task-28-home.png
  - [ ] task-28-mobile.png

  **Commit**: YES
  - Message: `feat(frontend): add home dashboard and navigation`
  - Files: `frontend/app/page.tsx`, `frontend/components/Navigation.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`

  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.

  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`

  Run `tsc --noEmit` + linter. Review all changed files for `as any`, empty catches, console.log in prod, commented-out code.

  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **E2E Testing** — `unspecified-high` (+ `playwright`)

  Execute every QA scenario from every task. Test cross-feature integration (auth → podcast, auth → dojo).

  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **PWA Audit** — `playwright`

  Run Lighthouse PWA audit. Verify offline mode works. Check installability on Chrome Android.

  Output: `PWA Score [N/100] | Offline [PASS/FAIL] | Installable [YES/NO] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(infra): scaffold auth-worker, D1 schema, Next.js PWA, R2 buckets`
- **Wave 2**: `feat(auth): implement OAuth flow, JWT validation, domain restriction, session management`
- **Wave 3**: `feat(podcast): add CRUD API, backoffice UI, audio upload, player, webhook`
- **Wave 4**: `feat(dojo): add PDF pipeline, LLM integration, gamification, leaderboard, UI`
- **Final**: `feat: integrate all features, add home dashboard, finalize PWA`

---

## Success Criteria

### Verification Commands
```bash
# Auth Worker
curl https://auth-worker.workers.dev/health  # {"status":"ok"}
curl https://auth-worker.workers.dev/user/me -b '__Host-session=valid-session'  # user profile

# Podcast Worker
curl https://podcast-worker.workers.dev/api/podcasts  # podcast list
curl https://podcast-worker.workers.dev/api/podcasts/:id  # podcast details

# Dojo Worker
curl https://dojo-worker.workers.dev/api/dojo/leaderboard  # leaderboard
curl https://dojo-worker.workers.dev/api/dojo/progress -b '__Host-session=valid-session'  # user progress

# Frontend
curl https://pages.dev/manifest.json  # valid PWA manifest
curl https://pages.dev/  # home page loads
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] PWA installable on Chrome Android
- [ ] Podcast plays offline
- [ ] Dojo works offline
- [ ] Microsoft OAuth works for @ecampus.ut.ac.id only
- [ ] Gamification (XP, badges, streaks, leaderboard) functional
- [ ] No secrets in git history

---

## Commit Strategy

---

## Success Criteria
