# cli

Interactive CLI (`@adrieldev/cli`) to scaffold and edit blog posts, built on
`@inquirer/prompts`. Authored in TypeScript and built with `tsdown` into `dist/index.js`.

From the repo root, `pnpm cli` builds it (`precli`) then runs
`node packages/cli/dist/index.js` pointed at `apps/site/src/content/posts`. Use the
"New Post" flow to scaffold a post — it names the folder `<YYYY-MM-DD>-<slug>` and writes
valid frontmatter, so you don't hand-roll post directories.

The `bin` entry needs a `#!/usr/bin/env node` shebang; it lives at the top of `src/index.ts`
so tsdown preserves it (and grants the executable bit) in `dist/index.js`.

## Commands

Run from the repo root (pnpm workspace):

```bash
pnpm cli              # build (precli) then launch the post CLI
pnpm --filter @adrieldev/cli build   # tsdown build only
```
