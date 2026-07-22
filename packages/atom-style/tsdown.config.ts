import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/atom-style.ts'],
  format: 'esm',
  dts: true,
  // Emit dist/atom-style.js + dist/atom-style.d.ts (not .mjs/.d.mts) to match
  // the paths declared in package.json "exports".
  fixedExtension: false,
})
