import { resolve } from 'node:path'

import js from '@eslint/js'
import markdown from '@eslint/markdown'
import astroParser from 'astro-eslint-parser'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import eslintPluginAstro from 'eslint-plugin-astro'
import pathAlias from 'eslint-plugin-path-alias'
import pluginReact from 'eslint-plugin-react'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tailwind from 'eslint-plugin-tailwindcss'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['**/dist/*', '**/.astro/*', '**/static/feed/*']),
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], plugins: { js }, extends: ['js/recommended'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  {
    plugins: {
      'path-alias': pathAlias,
    },
    rules: {
      'path-alias/no-relative': [
        'error',
        {
          paths: {
            // It's recommended to resolve path alias directories as
            // relative paths will be resolved relative to cwd. This
            // may cause unexpected behavior in monorepo setups
            '@': resolve(import.meta.dirname, './src'),
          },
          exceptions: [],
        },
      ],
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser, // ✅ pass imported object
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    plugins: {
      astro: eslintPluginAstro,
    },
    rules: {
      ...eslintPluginAstro.configs.recommended.rules,
    },
  },
  {
    ...pluginReact.configs.flat.recommended,
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },

  {
    files: ['**/*.mdx'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended'],
  },
  ...tailwind.configs['flat/recommended'],
  {
    files: ['**/*.astro', '**/*.tsx'],
    rules: {
      'tailwindcss/migration-from-tailwind-2': 'off',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/classnames-order': 'off',
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  eslintConfigPrettier,
])
