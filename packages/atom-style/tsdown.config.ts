import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/atom-style.ts'],
  // IIFE, not ESM: this script is injected into atom.xml as a classic
  // `<script src>` (no type="module") and reads `document.currentScript`, which
  // is null in module scripts. An ESM build also appends `export {}`, which is a
  // syntax error in a classic script and silently kills the whole feed styling.
  format: 'iife',
  // No dts: this is a side-effect-only script (no exports) consumed purely via
  // `@adrieldev/atom-style?url`, so it has no meaningful types. (tsdown skips
  // dts for iife anyway.)
  // Emit dist/atom-style.js to match package.json "exports". fixedExtension keeps
  // .js (not .mjs); entryFileNames drops the ".iife" infix tsdown adds to
  // non-esm/cjs bundles.
  fixedExtension: false,
  outputOptions: { entryFileNames: 'atom-style.js' },
})
