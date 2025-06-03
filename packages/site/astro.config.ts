import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import compress from '@playform/compress'
import { defineConfig } from 'astro/config'
import robotsTxt from 'astro-robots-txt'
import * as cheerio from 'cheerio'
import type { Text } from 'hast'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { rehypeGithubAlerts } from 'rehype-github-alerts'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGemoji from 'remark-gemoji'
import { titleCase } from 'title-case'
import type { Node, Parent } from 'unist'
import { visit } from 'unist-util-visit'

import hashTag from './src/assets/remix-icons/hashtag.svg?raw'
import SvgReactVitePlugin from './svg-react-vite-plugin'

const remarkTitleCase = () => {
  return (tree: Node) => {
    visit(tree, 'heading', (node: Parent) => {
      const textNode = node.children.find((n) => n.type === 'text') as Text | undefined

      if (textNode) {
        textNode.value = titleCase(textNode.value)
      }
    })
  }
}

function addDimensionsToSvg(svgString: string, size: string): string {
  const $ = cheerio.load(svgString, { xmlMode: true })
  const $svg = $('svg')

  $svg.attr('width', size)
  $svg.attr('height', size)

  return $.xml() // Return as string
}

const headerIcon = fromHtmlIsomorphic(
  `<span class="content-header-link-placeholder">${addDimensionsToSvg(hashTag, '24')}</span>`,
  { fragment: true }
)

const postsPagePattern = /^\/posts\/page\/\d+$/
const tagsPagePattern = /^\/tags\/[^/]+\/page\/\d+$/

export default defineConfig({
  site: 'https://adriel.dev',

  devToolbar: {
    enabled: false,
  },

  trailingSlash: 'never',

  vite: {
    plugins: [SvgReactVitePlugin()],
  },

  markdown: {
    gfm: true,
    syntaxHighlight: false,
    remarkPlugins: [remarkGemoji, remarkTitleCase],
    rehypePlugins: [
      rehypeSlug, // needed for rehypeAutolinkHeadings
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          headingProperties: {
            className: ['content-header'],
          },
          content: headerIcon,
        },
      ],
      [
        rehypePrettyCode,
        {
          keepBackground: false,
          defaultLang: {
            block: 'ts',
            inline: 'console',
          },
          theme: 'one-light',
        },
      ],
      rehypeGithubAlerts,
    ],
  },

  build: {
    inlineStylesheets: 'never',
  },

  integrations: [
    react(),
    tailwind(),
    mdx(),
    sitemap({
      filter: (page) => {
        const url = new URL(page)
        const pathName = url.pathname
        return !postsPagePattern.test(pathName) && !tagsPagePattern.test(pathName)
      },
    }),
    robotsTxt(),
    compress({
      Image: false,
      JavaScript: {
        terser: {
          format: {
            comments: 'all', // keep license notices
          },
        },
      },
    }),
  ],
})
