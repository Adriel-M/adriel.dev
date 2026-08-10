import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  dts: true,
  platform: 'browser',
  deps: {
    neverBundle: ['react', 'react-dom', /^react\//, /^react-dom\//, /^@docsearch\/(react|core)/],
  },
  // Emit dist/index.js + dist/index.d.ts (not .mjs/.d.mts) to match the
  // paths declared in package.json "exports".
  fixedExtension: false,
})
