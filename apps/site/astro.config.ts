import { unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import compress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
import robotsTxt from 'astro-robots-txt'
import XMLBuilder from 'fast-xml-builder'
import { XMLParser } from 'fast-xml-parser'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { rehypeGithubAlerts } from 'rehype-github-alerts'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGemoji from 'remark-gemoji'

import alertIcon from './src/assets/remix-icons/alert-line.svg?raw'
import feedbackIcon from './src/assets/remix-icons/feedback-line.svg?raw'
import hashTagIcon from './src/assets/remix-icons/hashtag.svg?raw'
import informationIcon from './src/assets/remix-icons/information-line.svg?raw'
import lightbulbIcon from './src/assets/remix-icons/lightbulb-line.svg?raw'
import spamIcon from './src/assets/remix-icons/spam-line.svg?raw'
import generateHeaders from './src/plugins/integration-generate-headers'
import { getPostDates } from './src/plugins/post-dates'
import rehypeHideHeading from './src/plugins/rehype-hide-heading'
import rehypeStripHiddenMarker from './src/plugins/rehype-strip-hidden-marker'
import remarkIncludeCode from './src/plugins/remark-include-code'
import remarkTitleCase from './src/plugins/remark-title-case'

const githubAdmonitionSize = 22

function addDimensionsToSvg(svgString: string, size: number): string {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' })
  const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '' })

  const obj = parser.parse(svgString)

  if (obj.svg) {
    obj.svg.width = size.toString()
    obj.svg.height = size.toString()
  }

  return builder.build(obj)
}

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

// Read once at config load rather than per-entry inside serialize()
const postDates = await getPostDates()

const headerIcon = fromHtmlIsomorphic(
  `<span class="content-header-link-placeholder">${addDimensionsToSvg(hashTagIcon, 24)}</span>`,
  { fragment: true }
)

export default defineConfig({
  site: 'https://adriel.dev',

  devToolbar: {
    enabled: false,
  },

  trailingSlash: 'never',

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      // Variable font: one file spans the whole range, so this is not 8 downloads
      weights: ['100 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
    server: {
      // Coder's preview subdomain host is per-workspace; skip Vite's host check.
      allowedHosts: true,
    },
    optimizeDeps: {
      // The workspace ESM wrapper keeps these ESM packages external. Vite's
      // Rolldown optimizer currently invalidates React's JSX runtime when it
      // discovers them on the first request, so serve their native ESM instead.
      exclude: [
        '@docsearch/core',
        '@docsearch/react/button',
        '@docsearch/react/modal',
        '@docsearch/react/version',
      ],
      include: ['use-sync-external-store/shim', 'use-sync-external-store/shim/with-selector'],
    },
    build: {
      // Vite 8's esbuild CSS minifier strips Tailwind v4's responsive @media
      // rules from the build (dev is unaffected), dropping every sm:/md:/lg:/xl:
      // utility. Skip Vite's minify and let @playform/compress (csso) minify the
      // CSS instead — it preserves the media queries.
      cssMinify: false,
    },
  },

  markdown: {
    syntaxHighlight: false,
    processor: unified({
      gfm: true,
      remarkPlugins: [remarkIncludeCode, remarkGemoji, remarkTitleCase],
      rehypePlugins: [
        rehypeStripHiddenMarker,
        rehypeSlug, // needed for rehypeAutolinkHeadings
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'prepend',
            properties: {
              ariaLabel: 'Link to this section',
            },
            headingProperties: {
              className: ['content-header'],
            },
            content: headerIcon,
          },
        ],
        rehypeHideHeading,
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
    }),
  },

  build: {
    inlineStylesheets: 'never',
  },

  integrations: [
    generateHeaders(),
    react(),
    mdx(),
    sitemap({
      serialize: (item) => {
        const id = new URL(item.url).pathname.match(/^\/posts\/(.+)$/)?.[1]
        const date = id ? postDates.get(id) : undefined
        return date ? { ...item, lastmod: date.toISOString() } : item
      },
    }),
    robotsTxt(),
    compress({
      Image: false,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
          collapseWhitespace: false,
        },
      },
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
