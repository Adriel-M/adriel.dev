# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm workspace monorepo orchestrated by Turborepo (`turbo.json`). Packages:

- `apps/site` — the Astro site at adriel.dev. Content collection, pages, components, vitest suite.
- `packages/cli` — interactive CLI (`tsdown`-built, `@inquirer/prompts`) to scaffold/edit blog posts. `pnpm cli` builds it (`precli`) then runs `node packages/cli/dist/index.js`. The `bin` entry needs a `#!/usr/bin/env node` shebang; it lives at the top of `src/index.ts` so tsdown preserves it (and grants the executable bit) in `dist/index.js`.
- `packages/esm-wrapper` — `tsdown`-built ESM shim around `@docsearch/react` so Astro's SSR can consume it. **`apps/site` imports this as `@adrieldev/esm-wrapper` and requires it to be built first** — `pnpm dev` runs `predev` to build it once then `dev:esm` (`tsdown --watch`) + `dev:site` concurrently, and `turbo run check` declares `@adrieldev/esm-wrapper#build` as a dependency. If you see missing-module errors from site code, rebuild esm-wrapper.
- `packages/atom-style` — `tsdown`-built client script (`@adrieldev/atom-style`, MIT, from [rss.style](https://github.com/fileformat/rss.style)) that makes `/atom.xml` human-readable in browsers. `apps/site/src/pages/atom.xml.ts` imports the **built** `dist/atom-style.js` with `?url` (`@adrieldev/atom-style?url`) and injects a `<script src>` into the feed, so it ships as its own hashed asset rather than being bundled. Authored in TS but consumed as transpiled JS — a `.ts?url` import would emit raw, un-transpiled TS. Built first via `^build`; `predev` also builds it for `pnpm dev`. The RSS.style logo is inlined directly in `atom-style.ts` as a hardcoded `data:` URI string rather than imported as a `.svg`/`.txt`/`?raw` asset, so the markup lives in the source. The stylesheet, being larger, is served separately: `water.light.css` (in `assets/`, exported as `@adrieldev/atom-style/water.light.css`) is imported `?url` by `atom.xml.ts` and handed to the script via a `data-water-css` attribute, read at module top-level (`document.currentScript` is null inside the script's `onreadystatechange` callback). `packages/atom-style/assets/` is `.prettierignore`d (vendored).
- `packages/eslint-configs` — shared flat ESLint config (`@adrieldev/eslint-configs`) consumed by every package.
- `packages/mdx-rs-demo` — leftover artifact directory, no `package.json`, ignore.

Deploy target is Cloudflare Workers static assets (`wrangler.jsonc` serves `apps/site/dist`, `trailingSlash: 'never'` + `drop-trailing-slash` are paired — don't add trailing slashes in links). A custom Astro integration `apps/site/src/plugins/integration-generate-headers.ts` emits the Cloudflare `_headers` file at build time (cache-control keyed off the most recent post's `updatedAt`/`createdAt`).

## Common commands

Run from repo root unless noted:

| Command | What it does |
| --- | --- |
| `pnpm dev` | Build esm-wrapper, then run it in watch + `astro dev` concurrently. Use this, not `pnpm --filter site dev` (dev-time site imports stale dist otherwise). |
| `pnpm build` | `turbo run build` across the workspace. |
| `pnpm preview` | `astro preview` on the built `apps/site/dist`. |
| `pnpm check` | `astro check` (type-checks `.astro` + TS). Depends on esm-wrapper build. |
| `pnpm lint` / `pnpm lint:fix` | ESLint (flat config) across all packages. |
| `pnpm format` / `pnpm format:fix` | Prettier across all packages. |
| `pnpm test` | `vitest run` in `apps/site` (the only package with tests). |
| `pnpm test:watch` | `vitest` watch mode in `apps/site`. |
| `pnpm cli` | Launches the post CLI pointed at `apps/site/src/content/posts`. |

Running a single test: `pnpm --filter site exec vitest run path/to/file.test.ts` or `… -t 'partial test name'`. Watch a single file with `pnpm --filter site exec vitest path/to/file.test.ts`.

CI (`.github/workflows/ci.yml`) pins a specific Node version and runs `lint`, `format`, `check`, `test` in order — mirror that locally before pushing. Husky pre-commit runs `lint-staged` (eslint --fix + prettier --write on staged `ts/tsx/css/mdx/js/mjs/astro`).

## Content pipeline (read this before editing posts or the markdown config)

Posts live at `apps/site/src/content/posts/<YYYY-MM-DD>-<slug>/index.mdx`. The collection is declared in `apps/site/src/content/definitions/posts.ts` (loaded via `content.config.ts`) with Zod schema:

- `title` (string)
- `createdAt` (date, required)
- `updatedAt` (date, optional)

Use `pnpm cli` → "New Post" to scaffold — it names the folder `<date>-<slug>` and writes valid frontmatter. Don't hand-roll directories. A post folder can colocate its own `.astro` components beside `index.mdx` and import them from the MDX (e.g. `2026-05-04-copy-fail-demo/V86Terminal.astro`).

Markdown is configured in `apps/site/astro.config.ts`:

- **Built-in syntax highlight is off**; code blocks are rendered by `rehype-pretty-code` with the `one-light` theme. Default lang is `ts` for blocks and `console` for inline.
- `remarkTitleCase` rewrites every heading to Title Case at build time via `title-case`.
- `rehypeAutolinkHeadings` prepends a hash icon to headings (class `content-header`), so heading markup in the DOM has an extra anchor child.
- `rehypeGithubAlerts` renders GFM alerts (`> [!NOTE]`, `[!IMPORTANT]`, `[!WARNING]`, `[!TIP]`, `[!CAUTION]`) with custom `remix-icons` SVGs — those icons need their `width`/`height` injected at build time (`addDimensionsToSvg`), that's why they're imported `?raw` and re-parsed.
- `remarkIncludeCode` (custom, `src/plugins/`): a code fence with a `file=./relative/path` meta (e.g. ```` ```ts file=./snippet.ts ````) replaces its body with that file's contents, resolved relative to the MDX file, and auto-adds `title="<basename>"` if no `title` is set.
- `remarkGemoji` enables GitHub `:shortcode:` emoji.
- `:hidden` heading convention (custom `rehypeStripHiddenMarker` + `rehypeHideHeading`): a heading whose text starts with `:hidden` (e.g. `## :hidden Notes`) has the marker stripped and gains `data-hidden` + a `hidden-heading` class — visually hidden but still slugged so it can anchor the floating TOC.

`apps/site/src/tests/blog-content.test.ts` is the content gate — it runs over every `.mdx` in the collection and fails CI when any of these hold:

1. `retext` proofreading flags anything (indefinite-article, redundant-acronyms, repeated-words, sentence-spacing, diacritics, English).
2. Frontmatter `title` is not already `titleCase(title)`.
3. Any markdown heading is not `titleCase(heading)`.

If you add a post with "a API" or "the the", the test will fail — fix the prose, don't loosen the test.

## TypeScript paths, imports, Astro conventions

- `apps/site/tsconfig.json` extends `astro/tsconfigs/strict`, sets `"paths": { "@/*": ["./src/*"] }`, and uses `jsx: "react-jsx"` with `jsxImportSource: "react"`.
- ESLint enforces `path-alias/no-relative` — always import site code as `@/libs/...`, `@/components/...`, etc., never relative paths that cross directories. The one exception is files already inside the same subdirectory.
- `simple-import-sort` is enabled; let `pnpm lint:fix` order imports rather than doing it by hand.
- Shared helpers to reach for before writing new ones:
  - `@/libs/CollectionUtils` — `getPosts`, `generatePostPath`. Sort order is newest-first by `createdAt`.
  - `@/libs/siteConfig` — author, Algolia DocSearch creds, locale, post summary length.
  - `@/libs/generate-summary`, `@/libs/ComponentOverrides` — used by the `PostLayout` (and `atom.xml.ts`). `ComponentOverrides` remaps MDX elements: `img`→`ResponsivePicture`, `a`→`Link`, `table`→`TableWrapper`, plus a `<Gallery>` component (PhotoSwipe lightbox, see `Gallery.astro`/`PhotoSwipe.astro`). `ObfuscatedEmail.tsx` (react-obfuscate-email) is the way to render email addresses.
- Pages follow Astro file-based routing: `apps/site/src/pages/posts/[id]/index.astro` uses `getStaticPaths` over `getCollection('posts')`.
- OG images are generated at request time by `@vercel/og` through `og.png.ts` endpoints (`/og.png`, `/posts/[id]/og.png`).

## Things that bite

- Don't edit `packages/esm-wrapper/dist` or expect `apps/site` to pick up source changes automatically outside of `pnpm dev` — the site consumes the built `dist/index.js`.
- When changing the markdown pipeline, run `pnpm test` afterward: the proofreading/title-case assertions parse MDX through `remark`/`retext` independently of Astro, so a regression in one pipeline won't necessarily surface in the other.
- Cloudflare `html_handling: drop-trailing-slash` + Astro `trailingSlash: 'never'` must stay in sync. If you flip one, flip the other.
- `build.inlineStylesheets: 'never'` is intentional (keeps CSS cacheable) — don't "optimize" it away.
- `.node-version` (`24.18.0`) pins the Node used by both the Cloudflare deploy build and (matching) GitHub CI. Don't remove it or drop below Node 22.18: tsdown loads its `tsdown.config.ts` files via native TS type-stripping, and on older Node its config loader falls back to the optional `unrun` peer dep (not installed), failing the build with "Failed to import module unrun". Cloudflare's build image defaults to Node 22.16.0, which hit exactly this — the pin is what avoids it. Note GitHub CI only runs `lint`/`format`/`check`/`test` and `check` builds only esm-wrapper (often a turbo remote-cache hit), so a broken tsdown build can stay green on GitHub and only fail in the Cloudflare deploy — verify build changes with a clean `pnpm build`.
