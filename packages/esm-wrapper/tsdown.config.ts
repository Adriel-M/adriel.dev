import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  dts: true,
  platform: 'browser',
  deps: {
    neverBundle: ['react', 'react-dom', /^react\//, /^react-dom\//, /^@docsearch\/(react|core)/],
  },
  fixedExtension: false,
})
