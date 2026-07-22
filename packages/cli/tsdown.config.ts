import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  // This package is a CLI (bin), not a library — no consumer needs its types.
  dts: false,
  // Emit dist/index.js (not .mjs) to match package.json "module"/"bin".
  fixedExtension: false,
})
