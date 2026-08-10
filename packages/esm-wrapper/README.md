# esm-wrapper

An ESM shim around the keyword-only `@docsearch/js/docsearch` entry
(`@adrieldev/esm-wrapper`) so Astro's SSR can consume it without bundling Ask AI.
Authored in TypeScript and built with `tsdown` into `dist/index.js`, consumed via the package
`exports` map.

`apps/site` imports this as `@adrieldev/esm-wrapper` and requires it to be built first —
`pnpm dev` runs `predev` to build it once then runs it in watch mode (`tsdown --watch`)
alongside `astro dev`, and `turbo run check` declares `@adrieldev/esm-wrapper#build` as a
dependency. If site code shows missing-module errors, rebuild esm-wrapper.

Don't edit `dist/` by hand or expect `apps/site` to pick up source changes automatically
outside of `pnpm dev` — the site consumes the built `dist/index.js`.

## Commands

Run from the repo root (pnpm workspace):

```bash
pnpm install          # install workspace deps
pnpm --filter @adrieldev/esm-wrapper build   # tsdown build
pnpm --filter @adrieldev/esm-wrapper dev     # tsdown --watch
```
