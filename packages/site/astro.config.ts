import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import compress from '@playform/compress'
import octicons from '@primer/octicons'
import { defineConfig } from 'astro/config'
import robotsTxt from 'astro-robots-txt'
import type { Text } from 'hast'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { rehypeGithubAlerts } from 'rehype-github-alerts'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGemoji from 'remark-gemoji'
import { titleCase } from 'title-case'
import type { Node, Parent } from 'unist'
import { visit } from 'unist-util-visit'

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

const headerIcon = fromHtmlIsomorphic(
  `<span class="content-header-link-placeholder">${octicons.hash.toSVG()}</span>`,
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

  markdown: {
    gfm: true,
    syntaxHighlight: false,
    remarkPlugins: [remarkGemoji, remarkTitleCase],
    rehypePlugins: [
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

  vite: {
    build: {
      assetsInlineLimit: 2048,
    },
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
