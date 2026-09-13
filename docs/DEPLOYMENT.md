# Deployment Guide — BITSOL AI Assistant

_Designed & Developed by BITSOL MARKETING_

This guide covers deploying to a production Linux server using **Docker +
Nginx**, plus a **PM2** alternative and a **GitHub Actions** CI/CD outline.

---

## 1. Prerequisites

- A Linux server (Ubuntu 22.04+ recommended) with a public IP / domain
- Docker + Docker Compose **or** Node.js 20+ and PM2
- PostgreSQL 14+ (managed or containerised) and Redis (optional but recommended)
- An AI provider key (e.g. `ANTHROPIC_API_KEY`)
- A domain name and TLS certificate (Let's Encrypt)

---

## 2. Environment

```bash
git clone <your-repo-url> bitsol-assistant && cd bitsol-assistant
cp .env.example .env
```

Set production values in `.env`:

- `NODE_ENV=production`
- `APP_URL` / `NEXT_PUBLIC_APP_URL` = `https://your-domain`
- `DATABASE_URL` = production PostgreSQL
- `REDIS_URL` = production Redis — **strongly recommended in production**, or
  rate limiting fails open and allows every request
- `JWT_SECRET` = `openssl rand -base64 48`
- `AI_PROVIDER` + the matching API key (`AI_MODEL` is optional — each
  provider has a default). Free option: `AI_PROVIDER=gemini` with a Google AI
  Studio key; see the README for its limits.
- On Claude Platform on AWS, also `ANTHROPIC_BASE_URL`
  (`https://aws-external-anthropic.<region>.api.aws`) and `ANTHROPIC_WORKSPACE_ID`
- `AI_EXTRACTION_MODEL` (optional) — a cheaper model from the same provider for
  the per-turn call that reads the customer's details; defaults to `AI_MODEL`
- `SALES_NOTIFY_EMAIL` — where new leads, meetings, tickets and handoffs are
  announced
- `SEED_ADMIN_PASSWORD` / `SEED_STAFF_PASSWORD` — **change these before seeding**

Keep `.env` out of version control (already in `.gitignore`).

---

## 3. Deploy with Docker Compose (recommended)

```bash
docker compose up -d --build
docker compose exec web npx prisma migrate deploy
docker compose exec web npm run db:seed          # first deploy only
docker compose logs -f web
```

This starts `db` (Postgres), `redis`, and `web` (the app on port 3000).
Health check: `curl http://localhost:3000/api/health`.

To update:
```bash
git pull
docker compose up -d --build web
docker compose exec web npx prisma migrate deploy
```

The seed is idempotent, so re-running it after editing the service catalogue
in `src/data` pushes those changes into the database. It never deletes: records
left from BITSOL Institute stay in the database, hidden from the app.

---

## 4. Nginx reverse proxy + TLS

`/etc/nginx/sites-available/bitsol`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;

    client_max_body_size 15m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Streaming (SSE) — disable proxy buffering for /api/chat.
    location /api/chat {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/bitsol /etc/nginx/sites-enabled/bitsol
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```

> **Important:** `proxy_buffering off` on `/api/chat` is required so streamed
> tokens — and the `meta` routing event that re-themes the UI — reach the
> browser immediately.
>
> `X-Forwarded-For` must be passed through: rate limiting and audit logs
> identify clients by it.

### WhatsApp webhook behind the proxy

The `location /` block above already serves `/webhook` — no extra nginx rule is
needed. Two things must not be interfered with:

- **The request body must arrive byte-for-byte.** The `X-Hub-Signature-256`
  check is an HMAC over the raw bytes, so any module that rewrites, re-encodes
  or pretty-prints JSON bodies will make every delivery fail with `401`.
- **The `X-Hub-Signature-256` header must reach the app.** nginx forwards it by
  default; a `proxy_set_header` block that whitelists headers must include it.

Meta requires a publicly resolvable HTTPS endpoint with a valid certificate —
finish `certbot` before registering the callback URL, or verification fails.

Verify the endpoint is reachable before touching the Meta console:

```bash
curl "https://your-domain.com/webhook?hub.mode=subscribe\
&hub.verify_token=$WHATSAPP_VERIFY_TOKEN&hub.challenge=ping"
# → ping
```

---

## 4b. Hostinger Business (shared hosting + Node.js)

Hostinger Business supports Node.js apps (up to 5) and can deploy straight from
GitHub — but **its shared plans do not offer PostgreSQL**, only MySQL. Postgres
is VPS-only.

Do **not** convert the schema to MySQL to work around this. Eleven fields are
`String[]` scalar lists (`keywords`, `benefits`, `features`, `process`,
`curriculum`, `careers`, `projects`, `expertise`, `tags`, `variables`), and
Prisma does not support scalar lists on MySQL. Converting means JSON columns or
eleven join tables, plus rewriting the seed and every query that reads them.

Use an **external managed Postgres** instead — the app connects over TLS and
neither knows nor cares where the database lives.

### Architecture

```
ai.bitsolmarketing.com
   ├── App    →  Hostinger Business · Node.js app (GitHub deploy)
   ├── DB     →  Neon / Supabase free tier (external Postgres over TLS)
   └── Redis  →  optional; Upstash, or omit and rate limiting fails open
```

### Steps

1. **hPanel → Websites → Subdomain** — create `ai.bitsolmarketing.com`.
2. **hPanel → Advanced → Node.js** — create an app:
   - Node version **20+**
   - Application root: the subdomain's directory
   - Startup file: `node_modules/next/dist/bin/next` with args `start`
     (or `npm start`)
   - Connect the GitHub repository and select branch `main`
3. **Environment variables** — set them in the Node.js app panel, not in a
   committed file. At minimum: `DATABASE_URL`, `JWT_SECRET`, `AI_PROVIDER`,
   the matching API key, `AI_MODEL`, `APP_URL`, `NEXT_PUBLIC_APP_URL`.

   > **Do not set `NODE_ENV=production` in the panel.** npm omits
   > devDependencies whenever `NODE_ENV=production`, and the panel applies its
   > variables to the install step too — so `npm ci` silently skips
   > `tailwindcss`, `postcss`, `typescript` and the `prisma` CLI, all of which
   > `next build` needs. The install reports success and the build then fails
   > on a missing Tailwind plugin.
   >
   > It is unnecessary anyway: `scripts/build.mjs` pins `NODE_ENV=production`
   > for the build, and `next start` sets it for the running server. The
   > committed `.npmrc` (`include=dev`) defends against this even if the
   > variable is set, but the simplest thing is to leave it out.
4. **Build.** Run `npm ci && npx prisma generate && npm run build` in the app's
   shell. Shared plans are tight on memory, so set this first:

   ```bash
   export LOW_MEMORY_BUILD=1
   export NODE_OPTIONS=--max-old-space-size=2048
   npm ci && npm run build
   ```

   `LOW_MEMORY_BUILD=1` makes Next generate pages in a single in-process worker
   instead of one per CPU. It is slower, but each worker otherwise holds its own
   copy of the compiler, and that is what exhausts the memory allowance.

   If it still dies, build in CI and deploy the output — see the note below.
5. **Migrate and seed**, once, from the app shell:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
6. **TLS** — enable the free SSL certificate for the subdomain in hPanel.

### Known constraints

### Debugging a failed build

> **`Cannot find module 'tailwindcss'`** (or `typescript`, `postcss`, `prisma`)
>
> devDependencies were skipped, because `NODE_ENV=production` was set during
> `npm ci`. Remove that variable from the panel and reinstall, or run
> `npm ci --include=dev`. The committed `.npmrc` should prevent it; if the host
> ignores project `.npmrc`, use the flag.

> **`<Html> should not be imported outside of pages/_document`**
>
> This does **not** mean a page imports `<Html>` — this project imports
> `next/document` nowhere, and `src/app/not-found.tsx` and `global-error.tsx`
> exist specifically to prevent the fallback that produces it.
>
> It is Next's *masking* error: something else crashed in the build worker, so
> Next fell back to the pages-router error document to report it while
> prerendering `/404`. **The real failure is in the lines above it.** On shared
> hosting it is almost always the build being OOM-killed — set
> `LOW_MEMORY_BUILD=1` as in step 4.
>
> Confirm whether the fault is the code or the host by checking the **Build**
> workflow on GitHub Actions: it runs `npm ci && npm run build` on a clean
> Linux/Node 20 checkout with no environment configured. Green there plus red
> on the host means the host is the problem.

| Constraint | Impact | Mitigation |
| --- | --- | --- |
| No PostgreSQL | Cannot host the DB locally | External Neon/Supabase (above) |
| Limited build memory | `next build` OOM-killed, reported as the `<Html>` error | `LOW_MEMORY_BUILD=1`; else build in GitHub Actions and deploy `.next` + `node_modules` |
| No Redis | Rate limiting fails open — every request allowed | Upstash free tier, or accept it and monitor `/admin/logs` |
| Shared CPU | Slower cold responses under load | Move to a VPS if response times degrade |
| Process restarts | In-memory state is lost | None needed — the app keeps no in-memory state |

If more than one of these bites, move to a **Hostinger VPS** (KVM 1 is enough)
and use the Docker Compose path in section 3 — same provider and billing, and
`docker-compose.yml` already provisions Postgres and Redis.

---

## 5. Alternative — bare metal with PM2

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run db:seed        # first deploy only

pm2 start npm --name bitsol-web -- start
pm2 save && pm2 startup
```

`ecosystem.config.js` (optional):
```js
module.exports = {
  apps: [{
    name: "bitsol-web",
    script: "node_modules/next/dist/bin/next",
    args: "start",
    instances: "max",
    exec_mode: "cluster",
    env: { NODE_ENV: "production", PORT: 3000 },
  }],
};
```

---

## 6. CI/CD (GitHub Actions outline)

`.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx prisma generate
      - run: npm run typecheck
      - run: npm run build
      # Then: build & push a Docker image, or rsync + `docker compose up -d`,
      # or SSH to the server and `git pull && docker compose up -d --build`.
```

Store secrets (`DATABASE_URL`, `ANTHROPIC_API_KEY`, SSH keys) in GitHub
repository secrets — never in the workflow file.

---

## 7. Go-live checklist

**Content — do this before announcing the assistant**

- [ ] Review service pricing in `src/data/marketing/services.ts`. Every figure
      ships as a clearly-labelled placeholder; the assistant presents them as
      indicative and offers a written quotation, but they should still be real.
- [ ] Update phone, WhatsApp, email, address and office hours in
      `src/lib/brands.ts`. The assistant is instructed never to give contact
      details beyond these values.
- [ ] Re-run `npm run db:seed` to push the changes into the database.
- [ ] Walk the Knowledge Base module (`/admin/knowledge`) and confirm every
      entry is accurate and `PUBLISHED`.

**Security**

- [ ] `JWT_SECRET` is a fresh 48-byte random string.
- [ ] Seeded accounts (`admin@bitsol.local`, `sales@bitsol.local`) have had
      their passwords changed, or been replaced with real staff accounts.
- [ ] Anyone still needing the console has a Marketing or unscoped account —
      former BITSOL Institute accounts are refused at sign-in.
- [ ] `REDIS_URL` is configured so rate limiting is actually enforced.
- [ ] TLS is live and HTTP redirects to HTTPS.

**Smoke test**

- [ ] `/chat` → the welcome screen shows the suggestions and the service rail.
- [ ] Ask about a service → the answer comes from Marketing content with an
      indicative price.
- [ ] Ask about individual courses or admissions → the assistant says they
      aren't offered and points to Corporate Training, without inventing details.
- [ ] Submit a quote request; confirm the reference appears in `/admin/crm/leads`.
- [ ] Ask to "talk to a human"; confirm a ticket appears in `/admin/support/tickets`.
- [ ] `curl https://your-domain/api/health` returns `"status":"healthy"`.

---

## 8. Backups & operations

- **Database backups:** schedule `pg_dump` (e.g. nightly) with off-site copies.
  ```bash
  docker compose exec db pg_dump -U bitsol bitsol_assistant > backup_$(date +%F).sql
  ```
- **Migrations:** always `prisma migrate deploy` (never `migrate dev`) in prod.
- **Health monitoring:** poll `/api/health`; alert on `503`.
- **Notification delivery:** the app queues rows in `notifications`. Run a worker
  that reads `status = QUEUED` and delivers via SMTP/SMS/WhatsApp, or monitor the
  queue depth at `/admin/notifications`.
- **Log rotation:** ship container logs to your logging stack. Application audit
  history lives in `system_logs` and is visible at `/admin/logs`.
- **Zero-downtime updates:** rebuild `web` while `db`/`redis` keep running.

---

<div align="center">
Designed &amp; Developed by <b>BITSOL MARKETING</b> — https://bitsolmarketing.com
</div>
