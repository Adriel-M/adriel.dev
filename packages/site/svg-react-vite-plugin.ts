import { transform } from '@svgr/core'
import * as esbuild from 'esbuild'
import fs from 'fs/promises'
import { type Plugin } from 'vite'

/**
 * Vite plugin to transform svg to react component.
 *
 * Needed because when importing an svg in jsx, it is converting it into astro code.
 * To not conflict with astro, only look for imports with `.svg?react`.
 */
export default function SvgReactVitePlugin(): Plugin {
  return {
    name: 'svg-react-vite-plugin',
    enforce: 'pre',

    async load(id) {
      if (id.includes('.svg?react')) {
        const [filepath] = id.split('?')
        const svgCode = await fs.readFile(filepath, 'utf8')
        const jsxCode = await transform(
          svgCode,
          {
            icon: true,
            memo: true,
            jsxRuntime: 'automatic',
            plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'removeViewBox',
                },
              ],
            },
          },
          { filePath: filepath }
        )

        const { code } = await esbuild.transform(jsxCode, {
          loader: 'jsx',
          format: 'esm',
          jsx: 'automatic',
          sourcefile: filepath,
        })

        return code
      }
    },
  }
}
