# UI audit (before redesign) — 2026-10-28

Baseline checks before any change: typecheck ✓, lint ✓, 32/32 tests ✓, build ✓ (`design/baseline-checks.md`).

## Pages today

| Route | What it shows |
| --- | --- |
| `/` Studio | Left sidebar (Studio/History links, category switch Image/Video/Audio/Tools, API key + credits box). Three columns: flat model list (search + groups by operation), the selected model's full schema form, and a "Queue" of recent tasks. |
| `/history` | Filter chips (category, state) and a vertical list of task cards. |
| Key dialog | Connect / Manage / Replace / Remove API key (modal from the sidebar). |

Screenshots: `design/before/{studio-image,studio-video,history}-{1440,390}.png`.

## Concrete UX problems

1. **The model picker is a long flat list** taking a full column (89 video models), with raw model IDs under every name and no description, price or tags.
2. **Settings are a raw form of every schema field**, in docs order: seed, safety checker, nsfw toggles sit at the same level as prompt and duration. Long docs descriptions under every field. Field names in `code` next to labels.
3. **Developer jargon on screen**: `POST /api/v1/jobs/createTask · model: …`, family badge `market`, `resultUrls`, `taskId`, "not set (provider default)".
4. **Reference uploads are per-field dropzones** named after API fields (`Image url`, `first_frame_url`), not one "Add references" area; no drag & drop onto the page.
5. **Cost is a separate grey panel** far from the Generate button; the button itself has no cost and is greyed out without a key (no explanation on click).
6. **Empty state is a sentence** ("No generations yet.") — no guidance on what to do.
7. **Queue cards are text-heavy**: balances, task IDs, timestamps, Original/Download links all visible at once; no hover actions (reuse prompt, use as reference, animate, open full screen).
8. **In-progress tasks look like finished ones** (a small status badge only); no skeleton / progress feel.
9. **No onboarding without a key**: every page renders, Generate is disabled, the only hint is a small box at the bottom of the sidebar.
10. **Light theme, generic neutral look**; navigation is by technical concept (Studio/History + "Category").
11. **Phone width**: the model list, the whole form and the queue stack vertically; the Generate button is far below the fold; the prompt is not reachable without long scrolling.
12. **Errors are rendered as raw labels/messages** inline only; no toasts, no plain-language next step.
13. A React hydration-attribute warning appears in the console on first load (to be re-checked after the redesign).
