import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'esnext',
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: false,
  shims: false,
  external: ['react', 'react-dom'],
})
