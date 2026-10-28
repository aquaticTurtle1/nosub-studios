# Task: redesign the UI of the existing Kie.ai Studio app to be as user-friendly as Higgsfield

This is an **existing, working app** (Next.js on `localhost:3000`) built from `kie-ai-studio-prompt.md`. The Kie.ai integration works and has been live-tested (Z-Image images, a 3-second video). The problem is purely UX/UI: the app is understandable to its developer but not friendly, not beautiful, and feels like a settings form rather than a creative studio.

**Goal:** rebuild the presentation layer so the app feels like a modern creative tool, using Higgsfield (higgsfield.ai) as the UX reference: take its *patterns*, not its brand.

## Hard constraints: do not break what works

- **Do not change** the Kie.ai client, adapters, catalog schemas, API routes, upload flow, polling, SQLite persistence, credit tracking or key handling, unless a UI change strictly requires a new read-only field. If you must touch them, explain why in the final report.
- Keep every behavior from the original brief: no fake "Cancel" (keep **Stop tracking** with its tooltip), cost confirmation for expensive runs, server-only key, local download of outputs, every catalog model visible (unverified ones keep a badge).
- Before editing, run the existing typecheck, lint, tests and build, and record the results. After the redesign, all of them must pass again.

## Step 0: audit the current UI first

1. Read the repo's layout, routes and components. List every current page and what it shows.
2. Take screenshots of every page at 1440×900 and 390×844 (Playwright or the browser tool available to you) and save them to `./design/before/`.
3. Write a short list of the concrete UX problems you see (e.g. "model picker is a long flat dropdown", "settings shown as a raw form with every field", "empty state is blank", "cost not visible before Generate"). Fix these, not imagined ones.

## Reference: what makes Higgsfield feel friendly

Observed on higgsfield.ai (October 2026). Reproduce these patterns.

**Global shell**
- Dark theme by default; one strong accent color used only for primary actions and active states; Inter (or similar) at ~14px body; 8–12px radii; generous spacing; almost no borders, separation by subtle surface contrast.
- Top-level navigation by *what you make*: **Explore · Image · Video · Audio · Tools · Library**. Not by technical concepts.

**Generation page (Image / Video / Audio)**: a fixed left control panel, in this exact order:
1. **References**: a drop zone "Add references — Image, Video or Audio" (only for models that accept them), with thumbnails of attached files.
2. **Prompt**: a large textarea with a helpful example placeholder (e.g. *"Describe the scene — e.g. 'A cinematic tracking shot along a sunlit coastal road'"*). Higgsfield lets you refer to attached references with `@` (`@image_1`); implement `@` autocomplete for attached references if the selected model takes multiple references, otherwise skip it.
3. **Model**: ONE compact row showing the current model (logo/icon, name, one-line description). Clicking it opens the model picker (see below). Never a long native `<select>`.
4. **Settings as chips**: the 3–4 most important settings as compact chips showing the current value, e.g. `Duration 5s` · `Aspect 16:9` · `Quality 1080p` · `Audio On`. Click a chip to open a small popover with the options. Everything else from the model schema goes into a collapsed **Advanced** section.
5. **Generate**: a large full-width primary button, with the **estimated credit cost shown on or under the button** (Higgsfield shows "80" under Generate). Use documented prices from the catalog; if a price is unknown, show the average cost of this model from local history, or "cost unknown". Keyboard shortcut Ctrl/Cmd+Enter.

**Main area of a generation page**
- **Empty state is never blank.** Show a 3-step how-to card row for the current mode, e.g. for image-to-video: **Add image → Choose preset → Get video**, each with an icon or thumbnail and one short sentence.
- Below it (or once there are results), a feed of this mode's generations: newest first, large media cards, in-progress items as shimmering skeleton cards with model name, elapsed time and status text ("Queued", "Generating… 0:42").
- Each finished card on hover: **Download**, **Open** (fullscreen lightbox with prompt and settings), **Reuse prompt** (fills the left panel with the same model, prompt and settings), **Use as reference** (images → into References), **Animate** (image → opens Video mode with this image attached).

**Model picker**
- A modal or large popover with a search field, grouped by category and operation (Text-to-video, Image-to-video, Edit, Upscale, …).
- Each model is a **card**: icon or a thumbnail of the user's last generation with it (if any), name, one-line plain-language description ("Fast and cheap, good for drafts"), tags such as `New`, `Unverified`, `Audio`, `Up to 10s`, and the price range if known.
- A small "Recent" row at the top with the 3–4 last-used models.

**Explore (home page)**
- Hero row of large cards, one per headline model or workflow ("Text to video", "Animate a photo", "Product shot", "Upscale"), each with a looping preview and a single CTA that opens the right mode with the right model preselected.
- A masonry gallery of the user's own best/latest generations. Video cards autoplay muted on hover (or in viewport, respecting `prefers-reduced-motion`).

**Presets (Higgsfield's "Choose preset")**
- Higgsfield's camera-motion and style presets are its own feature. Kie.ai models do not have them. Implement presets **honestly** as local prompt templates: a horizontal row of preset cards (e.g. "Slow push-in", "Orbit", "Handheld", "Drone reveal", "Golden hour", "Studio product shot") that append a well-written phrase to the prompt. Label them as prompt helpers, never as model features. Store them in one editable file (`lib/presets.ts`).

**Library**
- Grid of all generations with filters (Image / Video / Audio / Failed), search by prompt, sort, multi-select download. Failed and stopped tasks stay visible with a clear human-readable reason.

**Account area**
- Bottom of sidebar or top-right: credit balance as a pill (e.g. `◆ 1 240 credits`) that refreshes after each task; clicking it opens a panel with API key status (**Manage / Replace / Remove API key**) and spend per generation.
- If no key is set, the whole app shows a friendly onboarding screen with one CTA: **Connect API key**, plus a link to kie.ai/api-key. Do not show broken pages.

**Feedback and errors**
- Toasts in plain language with a next step: "Not enough credits. Top up on kie.ai and try again." instead of raw codes; raw code/message in an expandable "Details".
- Confirmation dialog before expensive runs shows the estimated credits and the note that Kie.ai generations cannot be canceled.
- Drag & drop a file anywhere on a generation page to attach it as a reference.

## Do NOT copy Higgsfield's brand or content

- Do not use Higgsfield's logo, name, wordmark, lime accent `#D1FE17`, images, videos, preset thumbnails, or copy text from their site. Do not hotlink anything from their CDNs.
- Give the app its own name (ask me for a name; if I am not around, use "Studio" and say so). The visual identity is already decided: the **Neon Pink** design system below. Do not pick colors yourself.
- Example and preview media come from **my own local generations**. Where there are none yet, use tasteful placeholders (gradient + icon), not stock media. Offer, as a separate opt-in action, a button "Generate examples" that lists exactly which cheap generations it would run and their total estimated cost, and runs nothing without my confirmation.

## Design system: Neon Pink (mandatory)

I am giving you `neon-pink-tokens.css`. It is the single source of truth for every color, font, spacing step, radius, shadow and motion value. Copy it into the app (e.g. `app/neon-pink-tokens.css`), import it once from `globals.css`, and remove or override any old light-theme variables so nothing white is left.

- **Dark only.** Remove the light theme and any theme toggle. Page canvas `--np-bg-0`, panels `--np-bg-1`, controls `--np-bg-2`, hover/popovers `--np-bg-3`. Separate areas by surface contrast, borders only where needed (`--np-border-subtle`).
- **One accent, used like a spotlight.** `--np-accent` (#ff2e93) only for: the Generate button, the active nav item, the selected/open chip ring, progress. **One filled accent element per view.** Text on accent is always `--np-on-accent` (dark plum), never white. Pink text/icons on dark use `--np-accent-text`. Washes use `--np-accent-soft`.
- `--np-shadow-accent` (soft pink glow) is allowed **only** on the Generate button. No glowing text, no neon borders on cards.
- States: `--np-success`, `--np-warning`, `--np-danger` with their `-soft` backgrounds. Danger is orange on purpose so errors never read as the pink accent; every error/status also has an icon and a word.
- Type: Inter for UI (`--np-font-sans`, body 14px/20px), Space Grotesk (`--np-font-display`) only for page titles (28px/600) and the Explore hero (48px/600). Labels 12px/500. Sentence case, no all-caps.
- Spacing 4px base (`--np-space-*`). Radii: `--np-radius-md` buttons/chips/inputs, `--np-radius-lg` media and model cards, `--np-radius-xl` control panel and dialogs, `--np-radius-full` pills.
- The file also maps shadcn/ui variables (`--background`, `--primary`, `--card`, `--popover`, `--ring`, `--sidebar-*` …) onto these tokens, so existing shadcn components pick up the theme. Note that shadcn's `--accent` is a hover surface, not the pink: use `--primary` / `--np-accent` for pink. If the project uses Tailwind v4, expose the `--np-*` tokens through `@theme inline` so classes like `bg-np-bg-2`, `text-np-accent-text`, `rounded-np-lg` exist; on Tailwind v3, extend `theme.colors` / `borderRadius` with `var(--np-…)`.
- Component specs to follow exactly:
  - **Button**: primary = accent fill + on-accent text + shadow-accent, hover `--np-accent-hover`, pressed `--np-accent-pressed`; secondary = `--np-bg-2`, hover `--np-bg-3`; ghost = transparent, `--np-text-secondary`, hover `--np-bg-3`. Height 40px, radius-md, 14px/500 label. Generate is primary, full width, cost after a middle dot in regular weight: `Generate · 30 credits`. Keep buttons enabled and explain on click instead of greying them out.
  - **Chip**: muted 12px label + 14px/500 value, height 32px, padding 12px, `--np-bg-2`, hover `--np-bg-3`; selected/open = `--np-accent-soft` background + 1px `--np-accent` ring + label in `--np-accent-text`. Status chips (Unverified, Low credits) use `--np-warning-soft` + `--np-warning`, not clickable.
  - **MediaCard**: `--np-bg-2`, radius-lg, no border. Generating = shimmer `--np-bg-2`↔`--np-bg-3` (1.6s, off under reduced motion), model name + `Generating… 0:42` in `--np-accent-text`. Done = media fills card, hover shows a `--np-scrim` action bar and lifts 2px, videos autoplay muted on hover. Failed = `--np-danger-soft`, "Failed" in `--np-danger`, then the reason and next step. Stopped = muted "Stopped tracking · Still running on Kie.ai and still charged."
- Grep the codebase afterwards: no hex colors, `white`, `black`, `bg-white`, `text-black`, `gray-*`/`zinc-*`/`slate-*` Tailwind palette classes may remain in components. Everything goes through the tokens.
- If a frontend/UI design skill is available in your environment, load it before writing components, but the tokens above override any palette or font it suggests.
- Use shadcn/ui primitives (Dialog, Popover, Command for the model search, Tooltip, Toast/Sonner, Tabs) restyled to the theme, and an icon set (lucide-react).
- Motion: short (150–250ms) ease-out transitions for popovers, hover lift on cards, shimmer on loading cards; respect `prefers-reduced-motion`.
- Responsive: at phone width the control panel becomes a bottom sheet with the prompt and Generate always reachable; no horizontal scroll.
- Accessibility: visible focus rings, labels on all icon buttons, contrast AA, everything reachable by keyboard.

## Work order

1. Audit + before-screenshots (Step 0).
2. Theme tokens and app shell (navigation, account pill, onboarding screen).
3. Generation page for **Video** first (left panel, chips, Generate with cost, empty state, feed cards). Show me screenshots and wait for my feedback before continuing, unless I said to proceed without stopping.
4. Apply the same components to Image and Audio; Tools as a grid of tool cards each opening its own simple panel.
5. Model picker modal.
6. Explore page, presets, Library.
7. Polish: toasts, confirmations, keyboard shortcuts, responsive, reduced motion.

Reuse components across modes; the three generation pages should differ only by config, not by copy-pasted code.

## Verification

- Typecheck, lint, existing tests and build pass.
- After-screenshots of every page at 1440×900 and 390×844 in `./design/after/`, plus a simple side-by-side `./design/compare.html` (before vs after) that I can open locally.
- Click-through check without spending credits: key onboarding, model switching (every catalog model appears in the picker), chips and Advanced settings change the request payload correctly (verify via a dry-run/log of the payload, not a real submit), reference upload UI, Reuse prompt, Animate, Library filters, Stop tracking.
- **No live generations** unless I explicitly confirm; every run costs real credits and cannot be canceled.

## Final report

1. What changed, page by page, with paths to before/after screenshots.
2. Which files were touched outside the UI layer, and why (ideally none).
3. Presets added and where to edit them.
4. Confirmation that no hard-coded colors remain (the grep result), and any token you had to add, with the reason.
5. Anything you could not do or verify, and anything that needs my decision (app name, whether to run "Generate examples").
