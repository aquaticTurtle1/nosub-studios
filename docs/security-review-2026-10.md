# Security review, October 2026

Scope: the repository before it is made public, branch `feat/cloud`. Checklist source: the "Безопасность"
section of `docs/superpowers/specs/2026-10-30-cloud-version-design.md`. The key point of the design is that in
cloud mode the Kie.ai key lives in the browser, so the worst threat is a foreign script on the page (XSS).

## Pre-publish repository checks

| Check | Result |
| --- | --- |
| Secret scan of the full git history (18 commits, all refs) | Clean. See method below. |
| `pnpm audit` | 1 low (`deepmerge` prototype poisoning, via the `shadcn` CLI and `@shadcn/registry`). No patched version exists. No high or critical. |
| Unused packages | Removed `@tiptap/extension-hard-break` (no import anywhere). Kept `cn` (`lib/utils.ts`), `js-yaml` and `@types/js-yaml` (`scripts/build-catalog.ts`), `shadcn` (`@import "shadcn/tailwind.css"` in `app/globals.css`). |
| `.gitignore` | Covers `.env*` (with `!.env.example`), `/data/`, `/.e2e-data/`, `/.next*` build dirs, `/test-results/`. `git ls-files` shows only `.env.example` among env, data and build paths, and it holds no values. |

Secret scan method (no new tools were installed): `git log -p --all` filtered for added lines matching `sk-`,
`AKIA`, `ghp_`/`github_pat_`, `xox[bp]-`, private-key headers, `Bearer <20+ chars>`, JWT shapes, and
`KEY|TOKEN|SECRET|PASSWORD = "<16+ chars>"` assignments. All historic file names were checked for `.env*`,
`*.pem`, `*.key`, `*.sqlite`, `*.db` and `data/`, and every 32+ character hex string was located. Findings: only
test values (`e2e-mock-key`, `e2e-owner-secret`, `sk-secret-kie-key-12345` in unit tests), and 32-hex strings
that are example `taskId` values inside the cached public Kie.ai docs (`docs-cache/`). Coverage is weaker than a
dedicated scanner such as gitleaks; consider enabling GitHub secret scanning after publishing.

## Checklist from the spec

| # | Item | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Strict CSP: `connect-src` only self and Kie hosts; `script-src` without `unsafe-inline` and third-party scripts; `frame-ancestors 'none'` | done (cloud, production) | `lib/cloud/security-headers.ts:29-44` (`contentSecurityPolicy`); per-request nonce in `proxy.ts`; unit tests in `tests/security-headers.test.ts` ("locks framing, objects and foreign scripts; no eval", "lets the page talk only to Studio and Kie.ai hosts"); e2e `e2e/cloud-prod.spec.ts` ("CSP header present", "page works under the CSP", "nonce differs per request"). Caveat: `style-src` keeps `'unsafe-inline'` (see limitations). |
| 2 | Prompts, file names and Kie responses are rendered as text only | done | No `dangerouslySetInnerHTML` anywhere in `app/`, `components/`, `lib/`. The only `innerHTML` is `components/app/generation/prompt-editor.ts:60`, which assigns the constant `AUDIO_ICON` (line 41), not user data. React escapes everything else. |
| 3 | Other headers: HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` | done (cloud, production) | `lib/cloud/security-headers.ts:48-53`, applied by `next.config.ts` `headers()`; test "sends the transport and privacy headers". Local mode is intentionally unchanged (localhost, no CSP). |
| 4 | All incoming requests to the Studio server validated with schemas (zod) | done for cloud routes; partial overall | `app/api/cloud/tasks/route.ts:7,27` (batch max 50), `lib/cloud/server/api.ts:7-16` (`TaskRecordSchema`, `ModeParam`, owner fingerprint regex, 256 KB body cap with 413). Tests in `tests/cloud-routes.test.ts`: "missing owner -> 400", "oversize -> 413", "saves and lists tasks; rejects bad batches", "draft round trip and mode validation". Local-mode routes validate generation input with zod as before. `TaskRecordSchema` uses `.passthrough()` (see limitations). |
| 5 | Database queries parameterized only | done | Every `execute` in `lib/cloud/server/history.ts` and `lib/cloud/server/rate-limit.ts` uses `sql` with `?` placeholders and `args`. The only assembled fragment is a `WHERE` clause built from fixed literals (`history.ts:38-51`); user values go through `args`. |
| 6 | Rate limiting on the Studio server | done | `lib/cloud/server/rate-limit.ts:5-17` (fixed window in the DB), applied in `gate()` at `lib/cloud/server/api.ts:36` (120 requests per minute per IP). Per-owner record cap `OWNER_CAP = 2000` with trimming (`history.ts:8,66`). Old rate rows pruned daily (`rate-limit.ts:20`). Test: "rate limit -> 429". |
| 7 | CORS: own origin only | done | No CORS headers are set anywhere, so browsers enforce same-origin. In addition `gate()` rejects `POST`/`PUT` whose `Origin` host differs or is missing (`api.ts:22-37`); test "foreign or missing origin -> 403". |
| 8 | Key never reaches the Studio server | done | e2e `e2e/cloud.spec.ts` "key never reaches Studio server" (inspects requests to the Studio origin), "key not stored in plain text", "disconnect wipes the key". Key storage: `lib/cloud/key-vault.ts` (AES-GCM with a non-extractable `CryptoKey`; HMAC fingerprint); unit tests `tests/key-vault.test.ts`. The server stores only `HMAC(CLOUD_OWNER_SECRET, fingerprint)` (`history.ts:10-14`). Cloud mode never uses `KIE_API_KEY`. |
| 9 | Cron endpoint protected | done | `app/api/cloud/cron/prune/route.ts:9-12` requires `Authorization: Bearer $CRON_SECRET` and fails closed when unset. Test "cron without secret -> 401, with secret -> 200". |
| 10 | Mode isolation (cloud routes absent in local mode and the reverse) | done | `cloudOnly()` / `localOnly()` guards; tests "cloud routes 404 in local mode", "local routes 404 in cloud mode". |
| 11 | Before publishing: history scan, `pnpm audit`, unused packages, ignored files | done | See the table above. |
| 12 | Final security review and report | done | This document. |
| n/a | Passwords, password reset, payments, admin panel | n/a | The product has none. |

## Fixed or found in this review

- Removed the unused dependency `@tiptap/extension-hard-break`.
- No secrets in history, no high or critical advisories, nothing sensitive tracked by git. No application code
  changes were needed.

## Known limitations and deferred items

Security-relevant:

- **Possible duplicate `createTask` on a reset connection.** Chrome may transparently retry a `POST` on a
  reused keep-alive connection that the server has reset, which could send `createTask` twice and charge twice.
  This is browser and network behavior outside the app's control, and the same risk exists server-side in local
  mode. The app itself never retries `createTask` after an ambiguous error (e2e "ambiguous submit not retried").
  Rare; the cost if it happens is one extra charge.
- **`style-src 'unsafe-inline'`.** Kept because the UI libraries inject inline styles. It affects styles only;
  `script-src` stays strict (nonce and `'strict-dynamic'`, no `unsafe-inline`, no `eval`).
- **CSP and security headers apply to cloud production only.** Local mode and dev servers run without them by
  design (single user on localhost).
- **Rate-limit key is the first `X-Forwarded-For` value** (`api.ts:14-17`). It is trustworthy behind Vercel's
  proxy; behind an untrusted proxy it could be spoofed. Per-owner caps still bound database growth.
- **`TaskRecordSchema` is `.passthrough()`**, with only `id` and `createdAt` required. Size is bounded by the
  256 KB body cap, 50 records per batch and the per-owner cap. Records are stored and returned as opaque JSON
  and rendered as text.
- **History is addressed by the key fingerprint.** Anyone who holds the same Kie key can read that key's
  history; this is intended (history follows the key). Changing `CLOUD_OWNER_SECRET` orphans existing history.
- **Pre-existing `pnpm audit` low:** `deepmerge` via the `shadcn` CLI; no patched release; build-time tooling only.
- Secret scan coverage is grep-based, not gitleaks (no new tool installs without owner consent).

Deferred minors from the task reviews (not security-critical):

- `loadKey` issues a second `store.get` after an `await` in the same read-only transaction; issue both before awaiting.
- The in-memory key can go stale across tabs after Disconnect in another tab (a `BroadcastChannel` would fix it).
- The "can't store the key" warning is not shown when the credit check fails after saving.
- If `applyStatus` throws after a successful submit with an immediate result (omni sync), the catch marks `submit_failed` although Kie accepted it.
- Days-left does not tick on mounted finished cards; the unsynced flag is set only on `list()` results.
- No spec asserts that a cloud past-result reference URL reaches the `createTask` body; the mock reuses one result URL (dev duplicate-key warning).
- The catalog (about 866 KB raw JSON) is in the client bundle, also in local mode; consider lazy-loading `cloudBackend` and the catalog.
- The `localOnly` import is placed above other imports in 12 routes (cosmetic).
- Resolved earlier: `uploads.remove` (no route, no caller) was dropped from the backend interface.
