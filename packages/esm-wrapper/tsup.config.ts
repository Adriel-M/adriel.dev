import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'], // Entry point to your library
  format: ['esm'], // Output ESM format
  target: 'es2020', // Reasonable modern JS target
  dts: true, // Generate .d.ts files
  clean: true, // Clean dist before build
  splitting: false, // Disable code splitting (simpler output)
  sourcemap: false, // Optional: enable if needed
  shims: false, // Avoid injecting Node polyfills
  external: ['react', 'react-dom'], // Do NOT bundle react (assume host app provides it)
})
