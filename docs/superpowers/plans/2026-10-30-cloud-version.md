# Облачная версия Studio — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Studio работает на Vercel в облачном режиме: ключ Kie.ai живёт только в браузере, история хранится в Turso по отпечатку ключа, файлы показываются со ссылок Kie. Локальный режим не меняется.

**Architecture:** Клиентский интерфейс `StudioBackend` с двумя реализациями. `localBackend` вызывает нынешние `/api/*` без изменений поведения. `cloudBackend` ходит в Kie.ai прямо из браузера (CORS проверен), пишет задачи сначала в IndexedDB и досылает их в `/api/cloud/*` (Turso). Режим выбирается при сборке через `NEXT_PUBLIC_STUDIO_MODE`. Общая логика подготовки генерации выносится из `/api/generate` в чистый модуль и используется обоими режимами.

**Tech Stack:** Next.js 16.4.3 (читать `node_modules/next/dist/docs/` перед кодом, см. `AGENTS.md`), React 19.3, TypeScript, zod 4, `@libsql/client` (Turso), WebCrypto, IndexedDB, vitest 5, Playwright 1.64 (`channel: "chrome"`), `fake-indexeddb` (dev).

**Spec:** `docs/superpowers/specs/2026-10-30-cloud-version-design.md`

## Global Constraints

- Ключ Kie.ai в облачном режиме **никогда** не уходит на сервер Studio: ни в теле, ни в заголовках, ни в URL, ни в cookie. Не пишется в `localStorage`, логи, ошибки, аналитику.
- Ключ на устройстве хранится только в IndexedDB, зашифрованный AES-GCM 256 ключом WebCrypto с `extractable: false`.
- Отпечаток ключа: hex HMAC-SHA-256, ключ HMAC — UTF-8 байты ключа Kie, сообщение — `kie-studio-history-v1`. На сервере хранится `owner` = hex HMAC-SHA-256(`CLOUD_OWNER_SECRET`, отпечаток).
- `createTask` никогда не повторяется автоматически. Неоднозначная ошибка → состояние `submit_unknown`.
- Вебхуки Kie в облачном режиме не используются (`callBackUrl` не передаётся).
- Файлы результатов не копируются: срок — 14 дней от `completedAt` (или `createdAt`), дальше файл помечен как недоступный.
- История на сервере — 90 дней. Лимит — 2000 задач на `owner`, при превышении удаляются самые старые.
- Генерация не блокируется недоступностью сервера Studio или Turso.
- Локальный режим ведёт себя как до изменений. Все нынешние тесты (`pnpm test`, `pnpm test:e2e`) остаются зелёными.
- Только бесплатные тарифы: Vercel Hobby, Turso free. Никакого файлового хранилища.
- Без бренда Higgsfield. В интерфейсе конкурентов по имени не называем. Язык интерфейса — английский.
- Никаких живых генераций на реальном ключе без явного подтверждения автора: каждая стоит кредитов.
- Коммит после каждой задачи. Push только по просьбе автора.

## Review Focus

1. **Вкладку закрыли во время генерации.** При следующем открытии задача подхватывается опросом и доходит до результата. Тест — Task 11, `resumes after reload`.
2. **Две вкладки с одним ключом.** Один и тот же `idempotencyKey` не отправляется дважды. При слиянии локальной и серверной копии побеждает терминальная, иначе — с бо́льшим `lastPolledAt`. Тест — Task 6, `mergeTasks`.
3. **Истёкший файл (старше 14 дней).** Карточка показывает «File expired», без бесконечной загрузки битой картинки. Тест — Task 10, `expiry badge`.
4. **Большой референс (видео > 4,5 МБ).** Файл идёт прямо в Kie и никогда через сервер Studio. Тест — Task 11, `large reference bypasses Studio server`.
5. **IndexedDB недоступна (приватный режим, запрет).** «Запомнить» не падает: ключ остаётся в памяти вкладки, показывается пояснение. Тест — Task 4, `falls back to memory`.

---

### Task 1: Режим и изоморфный клиент Kie

**Files:**
- Create: `lib/mode.ts`
- Modify: `lib/kie/client.ts` (убрать `import "server-only"`; базовые URL), `lib/kie/adapters/*.ts` и `lib/kie/errors.ts` (если там есть `server-only`)
- Move: `TIMEOUT_MS`, `backoffMs`, `POLL_START_MS` из `lib/server/tasks.ts` в `lib/generation/timing.ts` (реэкспорт из `tasks.ts` не нужен, импорты обновить)
- Modify: `.env.example`
- Test: `tests/mode.test.ts`

**Interfaces:**
- Produces: `type StudioMode = "local" | "cloud"`; `MODE: StudioMode` (из `process.env.NEXT_PUBLIC_STUDIO_MODE`, по умолчанию `"local"`, любое другое значение → `"local"`); `isCloud(): boolean`.
- Produces: `KIE_API_BASE_URL = NEXT_PUBLIC_KIE_API_BASE_URL || KIE_API_BASE_URL || "https://api.kie.ai"`, то же для upload с `NEXT_PUBLIC_KIE_UPLOAD_BASE_URL`. `kieRequest`, `uploadFile`, `getDownloadUrl`, `adapterFor` работают в браузере.
- Produces: `lib/generation/timing.ts` с теми же сигнатурами, что сейчас в `tasks.ts`.

- [ ] **Step 1:** Тест `MODE defaults to local`, `MODE is cloud only for "cloud"` (через `vi.stubEnv` + `vi.resetModules`).
- [ ] **Step 2:** `pnpm test tests/mode.test.ts` — FAIL (модуля нет).
- [ ] **Step 3:** Реализовать `lib/mode.ts`, правки клиента, перенос таймингов. В `.env.example` добавить блок облачного режима: `NEXT_PUBLIC_STUDIO_MODE`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `CLOUD_OWNER_SECRET`, `CRON_SECRET`.
- [ ] **Step 4:** `pnpm test && pnpm typecheck && pnpm lint` — PASS.
- [ ] **Step 5:** Commit `refactor: isomorphic Kie client and studio mode flag`.

### Task 2: Подготовка генерации — общий чистый модуль

**Files:**
- Create: `lib/generation/prepare.ts`
- Modify: `app/api/generate/route.ts` (использует `prepareGeneration`, поведение и ответы те же)
- Test: `tests/prepare-generation.test.ts`

**Interfaces:**
- Produces: `GenerateBody` — zod-схема и тип, перенесённые из `app/api/generate/route.ts` без изменений.
- Produces: `prepareGeneration(body: GenerateBody): PrepareResult`, где
  `PrepareResult = { ok: true; model: CatalogModel; variantTitle: string | null; input: Record<string, unknown>; estimate: CostEstimate } | { ok: false; status: 400 | 404 | 409 | 422; body: unknown }`.
  Шаги внутри — те же, что сейчас в роуте: модель, вариант, `serializePrompt`, `validateInput`, `estimateCost`, `needsConfirmation`. 409 возвращает `{ needsConfirmation: true, estimate }`, 422 — `{ error, issues }`, как сейчас.

- [ ] **Step 1:** Тесты: `unknown model → 404`, `invalid input → 422 with issues`, `expensive without confirmed → 409 with estimate`, `valid → ok with serialized prompt` (взять модель и вход из `tests/prompt-doc.test.ts`, например `minimax-h3/image-to-video`).
- [ ] **Step 2:** `pnpm test tests/prepare-generation.test.ts` — FAIL.
- [ ] **Step 3:** Реализовать, переписать роут на вызов модуля.
- [ ] **Step 4:** `pnpm test`, затем `pnpm test:e2e e2e/rollout.spec.ts e2e/references.spec.ts` — PASS (локальный режим не изменился).
- [ ] **Step 5:** Commit `refactor: extract prepareGeneration from /api/generate`.

### Task 3: Интерфейс `StudioBackend` и `localBackend`

**Files:**
- Create: `lib/backend/types.ts`, `lib/backend/local.ts`, `lib/backend/index.ts`
- Modify (все вызовы `/api/*` из клиента идут через `backend`): `components/studio/app-context.tsx`, `components/studio/key-dialog.tsx`, `components/studio/use-tasks.ts`, `components/app/generation/use-generator.ts`, `components/app/generation/media-library.tsx`, `components/app/generation/model-thumb.tsx`, `components/app/media/media-card.tsx`, `components/app/library/library-page.tsx`, `components/app/explore/examples-dialog.tsx`, `components/app/account-pill.tsx`, `lib/ui/local-ref.ts` (`previewUrl`, `saveLocalFile`)
- Test: существующие e2e

**Interfaces:**
- Produces (`lib/backend/types.ts`):
  ```ts
  interface StudioBackend {
    key: {
      status(): Promise<{ configured: boolean; source: KeySource | "browser" }>;
      connect(key: string, opts: { remember: boolean }): Promise<void>;
      disconnect(): Promise<void>;
    };
    credits(): Promise<{ balance: number; checkedAt: number }>;
    tasks: {
      list(q: { limit?: number; category?: string; activeOnly?: boolean }): Promise<TaskRecord[]>;
      /** Свежее состояние; опрашивает Kie, если пора. */
      get(id: string): Promise<TaskRecord>;
      act(id: string, action: "stop" | "resume" | "redownload" | "poll"): Promise<TaskRecord>;
    };
    generate(body: GenerateBody): Promise<{ task: TaskRecord; duplicate: boolean }>;
    uploads: { save(file: File): Promise<UploadRecord>; list(): Promise<UploadRecord[]>; remove(id: string): Promise<void> };
    drafts: { get(mode: string): Promise<Draft | null>; put(mode: string, draft: Draft, opts?: { keepalive?: boolean }): Promise<void> };
    previewUrl(uri: string): string;
    outputUrl(o: TaskOutput): string;
    downloadZip(taskIds: string[]): Promise<void>;
  }
  ```
  Ошибки — тот же `ApiError` из `components/studio/api.ts` с тем же `body`, чтобы UI не менялся (409/422 обрабатываются как сейчас).
- Produces: `backend: StudioBackend` из `lib/backend/index.ts`: `isCloud() ? cloudBackend : localBackend`. До Task 8 `cloudBackend` — заглушка, которая бросает `Error("cloud backend not built")`.
- `localBackend` — перенос нынешних `fetch` один в один, включая `keepalive` для черновиков.

- [ ] **Step 1:** Перенести вызовы, ничего не меняя в поведении.
- [ ] **Step 2:** `grep -rn "/api/" components lib/ui` — только внутри `lib/backend/local.ts`.
- [ ] **Step 3:** `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e` — PASS.
- [ ] **Step 4:** Commit `refactor: route client API calls through StudioBackend`.

### Task 4: Хранилище ключа в браузере

**Files:**
- Create: `lib/cloud/key-vault.ts`
- Modify: `package.json` (dev: `fake-indexeddb`)
- Test: `tests/key-vault.test.ts`

**Interfaces:**
- Produces: `saveKey(key: string, opts: { remember: boolean }): Promise<{ remembered: boolean }>`, `loadKey(): Promise<string | null>`, `clearKey(): Promise<void>`, `fingerprint(key: string): Promise<string>` (64 hex).
- IndexedDB: база `studio-vault`, хранилище `kv`, записи `wrap` (`CryptoKey`, AES-GCM 256, `extractable: false`) и `key` (`{ iv: Uint8Array; ct: ArrayBuffer }`). Ключ в памяти модуля на время жизни вкладки.

- [ ] **Step 1:** Тесты:
  - `remembered key round-trips` — `saveKey(k,{remember:true})`, сброс памяти модуля, `loadKey() === k`;
  - `nothing readable at rest` — в записи `key` нет подстроки ключа; `wrap.extractable === false`;
  - `remember:false keeps IndexedDB empty`;
  - `clearKey wipes both records and memory`;
  - `falls back to memory` — IndexedDB бросает при открытии → `saveKey` возвращает `{ remembered: false }`, `loadKey()` отдаёт ключ;
  - `fingerprint is stable and not the key` — известный вектор: `fingerprint("test-key")` равен HMAC-SHA-256(key=`test-key`, msg=`kie-studio-history-v1`), посчитанному в тесте через `node:crypto`.
- [ ] **Step 2:** `pnpm test tests/key-vault.test.ts` — FAIL.
- [ ] **Step 3:** Реализовать. Если `fake-indexeddb` в Node не клонирует `CryptoKey`, перенести тесты хранения в Playwright-спеку Task 11 и оставить в vitest только `fingerprint`.
- [ ] **Step 4:** Тесты — PASS.
- [ ] **Step 5:** Commit `feat(cloud): encrypted browser key vault`.

### Task 5: Облачная БД и история на сервере

**Files:**
- Create: `lib/cloud/server/db.ts`, `lib/cloud/server/history.ts`, `lib/cloud/server/rate-limit.ts`
- Modify: `package.json` (`@libsql/client`)
- Test: `tests/cloud-history.test.ts`

**Interfaces:**
- Produces: `cloudDb(): Client` — `createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN })`, в тестах `":memory:"`; `migrate(c: Client): Promise<void>` (идемпотентно).
- Таблицы: `tasks(owner TEXT, id TEXT, record_json TEXT, created_at INTEGER, updated_at INTEGER, PRIMARY KEY(owner,id))` + индекс `(owner, created_at DESC)`; `drafts(owner TEXT, mode TEXT, draft_json TEXT, updated_at INTEGER, PRIMARY KEY(owner,mode))`; `rate(bucket TEXT PRIMARY KEY, count INTEGER, window_start INTEGER)`.
- Produces (`history.ts`): `ownerOf(fp: string): string`; `saveTasks(owner, tasks: TaskRecord[]): Promise<void>` (upsert, затем `trimOwner`); `listTasks(owner, q: { limit?: number; category?: string; activeOnly?: boolean }): Promise<TaskRecord[]>`; `getTask(owner, id): Promise<TaskRecord | null>`; `trimOwner(owner, cap = 2000)`; `prune(now: number)` — удаляет `created_at < now − 90 дней`; `getDraft(owner, mode)`, `putDraft(owner, mode, draft)`.
- Produces (`rate-limit.ts`): `hit(bucket: string, limit: number, windowMs: number): Promise<boolean>` — `false`, когда лимит превышен.
- Все запросы параметризованные (`args`), без склейки строк.

- [ ] **Step 1:** Тесты: `owners are isolated`, `trim keeps newest 2000`, `prune drops older than 90 days`, `upsert replaces by id`, `ownerOf depends on CLOUD_OWNER_SECRET`, `rate limit blocks after limit and resets after window`.
- [ ] **Step 2:** `pnpm test tests/cloud-history.test.ts` — FAIL.
- [ ] **Step 3:** Реализовать.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(cloud): Turso history store`.

### Task 6: Облачные API-роуты и закрытие локальных роутов

**Files:**
- Create: `app/api/cloud/tasks/route.ts` (GET список, POST пакет до 50 задач), `app/api/cloud/tasks/[id]/route.ts` (GET), `app/api/cloud/drafts/[mode]/route.ts` (GET, PUT), `app/api/cloud/cron/prune/route.ts` (GET), `lib/server/mode-guard.ts`, `vercel.json`, `lib/cloud/merge.ts`
- Modify: каждый локальный роут (`key`, `generate`, `upload`, `uploads`, `uploads/[id]`, `files/[...path]`, `credits`, `tasks`, `tasks/[id]`, `webhook/kie`, `library-download`, `drafts/[mode]`) — первой строкой `localOnly()`
- Test: `tests/cloud-routes.test.ts`, `tests/merge.test.ts`

**Interfaces:**
- Produces: `localOnly(): Response | null` (404 в облаке), `cloudOnly(): Response | null` (404 локально).
- Владелец передаётся заголовком `X-Studio-Owner: <отпечаток, 64 hex>`, иначе 400. Сервер превращает его в `owner` через `ownerOf`.
- Каждый запрос `/api/cloud/*`: `hit("ip:"+ip, 120, 60_000)` → 429; для POST/PUT `Origin` должен совпадать с хостом, иначе 403; тело не больше 256 КБ, иначе 413; zod-проверка тела.
- Cron: `Authorization: Bearer ${CRON_SECRET}`, иначе 401; вызывает `prune(Date.now())`. `vercel.json`: `{"crons":[{"path":"/api/cloud/cron/prune","schedule":"0 4 * * *"}]}`.
- Produces (`lib/cloud/merge.ts`): `mergeTasks(local: TaskRecord[], remote: TaskRecord[]): TaskRecord[]` — по `id`; терминальная копия побеждает нетерминальную, иначе — с бо́льшим `lastPolledAt ?? createdAt`; сортировка по `createdAt` убыванием.

- [ ] **Step 1:** Тесты роутов (вызов handler с `Request`): `missing owner → 400`, `foreign origin → 403`, `oversize → 413`, `rate limit → 429`, `cron without secret → 401`, `local routes 404 in cloud mode`, `cloud routes 404 in local mode`. Тесты `mergeTasks`: терминальная побеждает, бо́льший `lastPolledAt` побеждает, порядок.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Реализовать.
- [ ] **Step 4:** `pnpm test && pnpm test:e2e` — PASS.
- [ ] **Step 5:** Commit `feat(cloud): history API routes and mode guards`.

### Task 7: Локальное хранилище облачного режима (IndexedDB)

**Files:**
- Create: `lib/cloud/local-store.ts`
- Test: `tests/local-store.test.ts`

**Interfaces:**
- IndexedDB `studio-local`: `tasks` (ключ `id`, индекс `idempotencyKey`; значение `{ task: TaskRecord; idempotencyKey: string; synced: boolean }`), `uploads` (ключ `id`; `{ record: UploadRecord; blob: Blob }`).
- Produces: `putTask(t: TaskRecord, o: { idempotencyKey: string; synced: boolean })`, `getTask(id)`, `findByIdempotency(key)`, `listTasks()`, `unsynced(): Promise<TaskRecord[]>`, `markSynced(ids: string[])`, `putUpload(file: File): Promise<UploadRecord>` (то же содержимое → та же запись, как в локальном режиме), `getUploadBlob(id)`, `listUploads()`, `deleteUpload(id)`.
- URI референсов остаётся `local://upload/<uuid>`.

- [ ] **Step 1:** Тесты: `same idempotency key is found`, `unsynced/markSynced`, `same bytes → same upload`, `delete removes blob`.
- [ ] **Step 2:** FAIL. **Step 3:** Реализовать. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(cloud): IndexedDB task outbox and reference store`.

### Task 8: `cloudBackend`

**Files:**
- Create: `lib/backend/cloud.ts`, `lib/cloud/sync.ts`, `lib/cloud/poll.ts`, `lib/zip.ts` (перенос `lib/server/zip.ts` на `Uint8Array`, серверный роут импортирует новый)
- Test: `tests/cloud-backend.test.ts`

**Interfaces:**
- Consumes: Task 1–7.
- `generate(body)` строго в таком порядке:
  1. `loadKey()`; нет ключа → `ApiError` `missing_key`.
  2. `prepareGeneration(body)`; `ok:false` → `ApiError(status, body)`.
  3. `findByIdempotency(body.idempotencyKey)` → вернуть `{ task, duplicate: true }`.
  4. Запись `submitting` → `putTask(..., { synced: false })`.
  5. Баланс (ошибка = `null`); если оценка больше баланса → `submit_failed` с тем же текстом, что `submitTask` на сервере.
  6. Референсы `local://upload/*` → `uploadFile(key, blob, crypto.randomUUID()+ext, "kie-studio/<kind>")` → `replaceLocalUris`.
  7. `adapterFor(family).submit(model, input, { key })` — без `callBackUrl`.
  8. Успех → `pending`, `deadlineAt = now + TIMEOUT_MS[category]`, `nextPollAt = now + POLL_START_MS`. Неоднозначная ошибка → `submit_unknown`. Иначе → `submit_failed`. Без повторов.
  9. `putTask`, `scheduleSync()`.
- `tasks.get(id)` → `pollIfDue(task, key)` (`lib/cloud/poll.ts`): та же логика сроков и бэкоффа, что `pollTask` на сервере. Результаты — ссылки Kie с `localPath: null`. Затем `putTask` и `scheduleSync()`.
- `tasks.list(q)` → `mergeTasks(localStore.listTasks(), GET /api/cloud/tasks)`; сервер недоступен → только локальные.
- `tasks.act`: `stop`/`resume` — локально; `redownload` — свежие ссылки через `getDownloadUrl(key, url)`; `poll` — принудительный опрос.
- `lib/cloud/sync.ts`: `scheduleSync()` — POST `unsynced()` пакетами по 50 в `/api/cloud/tasks`, при успехе `markSynced`; ошибка → повтор через 30 с.
- Все запросы к своему серверу — с заголовком `X-Studio-Owner: await fingerprint(key)` и **без** ключа.
- `credits()` → `chat/credit` из браузера. `key.status()` → `{ configured: !!loadKey(), source: "browser" }`.
- `outputUrl(o) = o.url`. `previewUrl(uri)` для `local://upload/*` → object URL из кеша, который заполняют `uploads.list()` и `uploads.save()`.
- `downloadZip(ids)` — `fetch` каждого файла (у `tempfile.aiquickdraw.com` CORS `*`), `zip()` из `lib/zip.ts`, скачивание через object URL. Истёкшие файлы пропускаются.
- Produces: `expiresAt(t: TaskRecord): number = (t.completedAt ?? t.createdAt) + 14 * 86_400_000` (в `lib/cloud/expiry.ts`).

- [ ] **Step 1:** Тесты с подменённым `fetch` и `fake-indexeddb`:
  - `never sends the key to Studio` — по всем вызовам `fetch` на свой origin ни URL, ни заголовки, ни тело не содержат ключ;
  - `ambiguous createTask is not retried` — `fetch` к `createTask` бросает сетевую ошибку → `submit_unknown`, вызов ровно один;
  - `duplicate idempotency key returns existing task`;
  - `server down: generation succeeds, task stays unsynced, syncs later`;
  - `insufficient credits → submit_failed, createTask not called`;
  - `references upload straight to Kie`;
  - `zip round-trip` — `lib/zip.ts` выдаёт архив с правильным числом записей в центральном каталоге.
- [ ] **Step 2:** FAIL. **Step 3:** Реализовать. **Step 4:** PASS, плюс `pnpm test:e2e` (локальный ZIP через новый `lib/zip.ts`).
- [ ] **Step 5:** Commit `feat(cloud): browser-direct cloud backend`.

### Task 9: Ключ и онбординг в интерфейсе

**Files:**
- Modify: `components/studio/key-dialog.tsx`, `components/app/onboarding.tsx`, `components/app/account-pill.tsx`
- Test: в `e2e/cloud.spec.ts` (Task 11)

**Interfaces:**
- Окно ключа в облаке: галочка «Remember on this device» (включена по умолчанию), кнопка «Disconnect key», тексты:
  - «Your key stays in this browser. Studio's server never receives it.»
  - «If your key leaks, create a new one in Kie.ai.»
  - «A new key starts a new history.»
  - Если `saveKey` вернул `remembered: false`: «This browser can't store the key. It will be asked again next time.»
- Онбординг в облаке при первом входе без ключа — шаги: что такое Kie.ai (оплата за генерацию, $5 = 1,000 credits, кредиты не сгорают), регистрация, пополнение от $5, где взять API-ключ, вставить ключ. Ссылки на страницы Kie проверить вручную перед коммитом. Конкурентов не называть. Финальные тексты — на усмотрение исполнителя.
- Локальный режим: окно и онбординг без изменений.

- [ ] **Step 1:** Реализовать. **Step 2:** `pnpm typecheck && pnpm lint && pnpm test:e2e` — PASS. **Step 3:** Commit `feat(cloud): key dialog and onboarding for cloud mode`.

### Task 10: Сроки файлов и пометки в карточках

**Files:**
- Modify: `components/app/media/media-card.tsx`, при необходимости `components/app/library/library-page.tsx`
- Create: `lib/cloud/expiry.ts` (если не создан в Task 8)
- Test: `tests/expiry.test.ts`

**Interfaces:**
- `daysLeft(t: TaskRecord, now: number): number = Math.ceil((expiresAt(t) − now) / 86_400_000)`.
- Только в облаке: «Available N more days» (N ≤ 3 — цвет предупреждения), «File expired» при N ≤ 0. Для истёкших превью не загружается. «Only on this device» — для несинхронизированной задачи.

- [ ] **Step 1:** Тесты `daysLeft`: 14 сразу после завершения, 1 за час до срока, ≤ 0 после. Тест `expiry badge` — в Task 11.
- [ ] **Step 2:** FAIL. **Step 3:** Реализовать. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(cloud): file expiry badges`.

### Task 11: Безопасность страницы и e2e облачного режима

**Files:**
- Modify: `next.config.ts` (заголовки; CSP — только при `isCloud()` в production), при необходимости `proxy.ts` для nonce — сначала прочитать документацию Next 16 в `node_modules/next/dist/docs/`
- Modify: `e2e/mock-kie.mjs` (CORS-заголовки на всех ответах и на `OPTIONS`; счётчик вызовов `createTask` уже есть в `/__calls`, иначе добавить)
- Modify: `playwright.config.ts` — второй проект `cloud`: порт 3101, `NEXT_DIST_DIR=.next-e2e-cloud`, `NEXT_PUBLIC_STUDIO_MODE=cloud`, `NEXT_PUBLIC_KIE_API_BASE_URL` и `NEXT_PUBLIC_KIE_UPLOAD_BASE_URL` → mock, `TURSO_DATABASE_URL=file:.e2e-data/cloud.db`, `CLOUD_OWNER_SECRET=e2e-owner-secret`, `CRON_SECRET=e2e-cron`. Локальный проект не трогать.
- Create: `e2e/cloud.spec.ts`

**Interfaces:**
- Заголовки:
  - `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'nonce-…'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.kie.ai https://kieai.redpandaai.co https://tempfile.aiquickdraw.com; img-src 'self' blob: data: https://tempfile.aiquickdraw.com; media-src 'self' blob: https://tempfile.aiquickdraw.com; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`. Хосты результатов дополнить по реальным ответам и примерам Explore.
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

- [ ] **Step 1:** Спеки в `e2e/cloud.spec.ts`:
  - `key never reaches Studio server` — подключить тестовый ключ `e2e-mock-key`, сгенерировать фото; по всем запросам на `localhost:3101` (URL, заголовки, тело) ключа нет;
  - `key not stored in plain text` — в IndexedDB и `localStorage` нет подстроки ключа;
  - `history follows the key` — новый контекст браузера, тот же ключ → видна та же генерация;
  - `disconnect wipes the key` — после «Disconnect key» и перезагрузки ключа нет;
  - `resumes after reload` — перезагрузка во время `pending` → задача доходит до `success`;
  - `server down still generates` — `page.route("**/api/cloud/**", r => r.abort())` → генерация успешна, видно «Only on this device»; после снятия блокировки — синхронизация;
  - `ambiguous submit not retried` — mock рвёт соединение на `createTask` → `submit_unknown`, в `/__calls` один `createTask`;
  - `large reference bypasses Studio server` — референс 6 МБ; ни одного запроса на свой origin с телом > 1 МБ;
  - `expiry badge` — задача с `completedAt` 15 дней назад (через БД теста) → «File expired»;
  - `CSP header present` — в production-сборке (`next build && next start` для этой спеки) у ответа `/` есть `Content-Security-Policy` с `frame-ancestors 'none'`.
- [ ] **Step 2:** `pnpm test:e2e --project=cloud` — FAIL.
- [ ] **Step 3:** Реализовать заголовки и правки mock.
- [ ] **Step 4:** `pnpm test:e2e` (оба проекта) — PASS.
- [ ] **Step 5:** Commit `feat(cloud): security headers and cloud e2e`.

### Task 12: Чистка репозитория перед публикацией и проверка безопасности

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `.gitignore`, `README.md`, `.env.example`
- Create: `docs/security-review-2026-10.md`

- [ ] **Step 1:** Скан всей истории git на секреты (`gitleaks detect --log-opts="--all"` или аналог; установку нового инструмента согласовать с автором). Найдено → остановиться и сообщить автору: такой ключ нужно отозвать.
- [ ] **Step 2:** `pnpm audit` — исправить high/critical.
- [ ] **Step 3:** Удалить неиспользуемые пакеты (`@tiptap/extension-hard-break` не используется; проверить `shadcn`, `cn`, `js-yaml`).
- [ ] **Step 4:** `.gitignore` покрывает `.env*` (кроме `.env.example`), `data/`, `.e2e-data/`, `.next*`; `git ls-files` — ничего из этого нет.
- [ ] **Step 5:** README: раздел «Cloud deploy» (Turso, Vercel, переменные) и раздел «How your key is handled».
- [ ] **Step 6:** Ревью безопасности по чек-листу спеки → `docs/security-review-2026-10.md`: найдено, исправлено, что осталось.
- [ ] **Step 7:** `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e && pnpm build` — PASS.
- [ ] **Step 8:** Commit `chore: pre-publish cleanup and security review`.

### Task 13: Деплой (шаги автора, исполнитель готовит инструкции)

Создание аккаунтов и ввод паролей делает только автор.

- [ ] **Step 1 (автор):** Создать бесплатную БД Turso, получить `TURSO_DATABASE_URL` и `TURSO_AUTH_TOKEN`.
- [ ] **Step 2 (автор):** Сделать репозиторий публичным на GitHub (после Task 12) и импортировать его в Vercel (Hobby).
- [ ] **Step 3 (автор):** Переменные в Vercel: `NEXT_PUBLIC_STUDIO_MODE=cloud`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `CLOUD_OWNER_SECRET` и `CRON_SECRET` (случайные, по 32+ байта). `KIE_API_KEY` в облаке **не задавать**.
- [ ] **Step 4 (исполнитель):** Проверить развёрнутый сайт без ключа: заголовки, онбординг, 404 на локальных роутах.
- [ ] **Step 5 (автор подтверждает):** Первая настоящая генерация самой дешёвой моделью. Проверить в DevTools → Network, что ключ не уходит на домен Studio. Это и есть проверка CORS с настоящим ключом.
