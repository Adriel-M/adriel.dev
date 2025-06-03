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

import alertIcon from './src/assets/remix-icons/alert-line.svg?raw'
import feedbackIcon from './src/assets/remix-icons/feedback-line.svg?raw'
import hashTagIcon from './src/assets/remix-icons/hashtag.svg?raw'
import informationIcon from './src/assets/remix-icons/information-line.svg?raw'
import lightbulbIcon from './src/assets/remix-icons/lightbulb-line.svg?raw'
import spamIcon from './src/assets/remix-icons/spam-line.svg?raw'
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

function addDimensionsToSvg(svgString: string, size: number): string {
  const castedSize = size.toString()
  const $ = cheerio.load(svgString, { xmlMode: true })
  const $svg = $('svg')

  $svg.attr('width', castedSize)
  $svg.attr('height', castedSize)

  return $.xml()
}

const githubAdmonitionSize = 22

const config = {
  alerts: [
    {
      keyword: 'NOTE',
      icon: addDimensionsToSvg(informationIcon, githubAdmonitionSize),
      title: 'Note',
    },
    {
      keyword: 'IMPORTANT',
      icon: addDimensionsToSvg(feedbackIcon, githubAdmonitionSize),
      title: 'Important',
    },
    {
      keyword: 'WARNING',
      icon: addDimensionsToSvg(alertIcon, githubAdmonitionSize),
      title: 'Warning',
    },
    {
      keyword: 'TIP',
      icon: addDimensionsToSvg(lightbulbIcon, githubAdmonitionSize),
      title: 'Tip',
    },
    {
      keyword: 'CAUTION',
      icon: addDimensionsToSvg(spamIcon, githubAdmonitionSize),
      title: 'Caution',
    },
  ],
}

const headerIcon = fromHtmlIsomorphic(
  `<span class="content-header-link-placeholder">${addDimensionsToSvg(hashTagIcon, 24)}</span>`,
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
      [rehypeGithubAlerts, config],
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
