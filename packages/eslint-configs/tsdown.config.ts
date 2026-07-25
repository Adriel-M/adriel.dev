import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  dts: true,
  // Emit dist/index.js + dist/index.d.ts (not .mjs/.d.mts) to match the
  // paths declared in package.json "exports".
  fixedExtension: false,
  // Externalize every dependency. tsdown only auto-externalizes
  // `dependencies`/`peerDependencies`; the ESLint plugins are
  // `devDependencies` (they'd otherwise inflate the bundle to ~16 MB, and
  // reclassifying them as prod deps drags their transitive tree — e.g.
  // eslint-plugin-path-alias -> unset-value — into the production security
  // scan). Keeping them external + dev leaves the built config a thin
  // re-export resolved from node_modules at lint time.
  deps: {
    neverBundle: true,
  },
})
