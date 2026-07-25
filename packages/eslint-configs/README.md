# eslint-configs

Shared flat ESLint config (`@adrieldev/eslint-configs`) consumed by every package in the
workspace. Authored in TypeScript (`src/index.ts`) and built with `tsdown` into
`dist/index.js` (+ `dist/index.d.ts`), consumed via the package `exports` map.

The ESLint plugins it composes stay in `devDependencies`, and `tsdown.config.ts` sets
`deps: { neverBundle: true }` to externalize them — tsdown only auto-externalizes
`dependencies`/`peerDependencies`, so without this it would inline every plugin into a huge
`index.js`. The plugins are deliberately not promoted to `dependencies`: this package is
workspace-internal (never published, so its devDeps are always installed), and moving the
plugins to prod deps drags their transitive tree into the production security scan and fails
CI. `eslint` itself is a `peerDependency`.

Because the config is consumed from `dist`, `turbo run lint`/`lint:fix` declare
`@adrieldev/eslint-configs#build` as a dependency, so a fresh checkout must build it before
linting works.

## Commands

Run from the repo root (pnpm workspace):

```bash
pnpm install          # install workspace deps
pnpm --filter @adrieldev/eslint-configs build   # tsdown build
```
