# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm workspace monorepo orchestrated by Turborepo (`turbo.json`). Packages:

- `apps/site` — the Astro site at adriel.dev. Content collection, pages, components, vitest suite.
- `packages/cli` — interactive CLI (`tsx`-run, `@inquirer/prompts`) to scaffold/edit blog posts.
- `packages/esm-wrapper` — `tsup`-built ESM shim around `@docsearch/react` so Astro's SSR can consume it. **`apps/site` imports this as `@adrieldev/esm-wrapper` and requires it to be built first** — `pnpm dev` runs `predev` to build it once then `dev:esm` (`tsup --watch`) + `dev:site` concurrently, and `turbo run check` declares `@adrieldev/esm-wrapper#build` as a dependency. If you see missing-module errors from site code, rebuild esm-wrapper.
- `packages/eslint-configs` — shared flat ESLint config (`@adrieldev/eslint-configs`) consumed by every package.
- `packages/mdx-rs-demo` — leftover artifact directory, no `package.json`, ignore.

Deploy target is Cloudflare Workers static assets (`wrangler.jsonc` serves `apps/site/dist`, `trailingSlash: 'never'` + `drop-trailing-slash` are paired — don't add trailing slashes in links).

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
- `tags` (`string[]`, duplicates rejected, each transformed through `generateSluggedTag` → `{ tag: slug(tag) }`)
- `createdAt` (date, required)
- `updatedAt` (date, optional)

Use `pnpm cli` → "New Post" to scaffold — it names the folder `<date>-<slug>` and writes valid frontmatter. Don't hand-roll directories.

Markdown is configured in `apps/site/astro.config.ts`:

- **Built-in syntax highlight is off**; code blocks are rendered by `rehype-pretty-code` with the `one-light` theme. Default lang is `ts` for blocks and `console` for inline.
- `remarkTitleCase` rewrites every heading to Title Case at build time via `title-case`.
- `rehypeAutolinkHeadings` prepends a hash icon to headings (class `content-header`), so heading markup in the DOM has an extra anchor child.
- `rehypeGithubAlerts` renders GFM alerts (`> [!NOTE]`, `[!IMPORTANT]`, `[!WARNING]`, `[!TIP]`, `[!CAUTION]`) with custom `remix-icons` SVGs — those icons need their `width`/`height` injected at build time (`addDimensionsToSvg`), that's why they're imported `?raw` and re-parsed.

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
  - `@/libs/CollectionUtils` — `getPosts`, `getPostsByTag`, `generatePostPath`, `getTagCounts`, `sortTagsByAlpha`. Sort order is newest-first by `createdAt`.
  - `@/libs/SluggedTag` — the `SluggedTag` type and `generateSluggedTag` (github-slugger). Tag routing and `getPostsByTag` compare on the slugged form.
  - `@/libs/siteConfig` — author, Algolia DocSearch creds, pagination counts (`postsInFrontPageCount`, `postsInPostsPageCount`).
  - `@/libs/generate-summary`, `@/libs/ComponentOverrides` — used by the `PostLayout`.
- Pages follow Astro file-based routing: `apps/site/src/pages/posts/[id]/index.astro` uses `getStaticPaths` over `getCollection('posts')`, `posts/page/[page].astro` paginates, `tags/[tag]/...` mirrors that for tag archives. Sitemap config excludes paginated routes (`/posts/page/\d+`, `/tags/*/page/\d+`) via the `filter` callback — add any new paginated paths to that filter too.
- OG images are generated at request time by `@vercel/og` through `og.png.ts` endpoints (`/og.png`, `/posts/[id]/og.png`).

## Things that bite

- Don't edit `packages/esm-wrapper/dist` or expect `apps/site` to pick up source changes automatically outside of `pnpm dev` — the site consumes the built `dist/index.js`.
- When changing the markdown pipeline, run `pnpm test` afterward: the proofreading/title-case assertions parse MDX through `remark`/`retext` independently of Astro, so a regression in one pipeline won't necessarily surface in the other.
- Cloudflare `html_handling: drop-trailing-slash` + Astro `trailingSlash: 'never'` must stay in sync. If you flip one, flip the other.
- `build.inlineStylesheets: 'never'` is intentional (keeps CSS cacheable) — don't "optimize" it away.
