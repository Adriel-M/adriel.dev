import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { AstroIntegration } from 'astro'
import matter from 'gray-matter'

import { truncateToSeconds } from '../libs/DateUtils'

async function getLatestPostDate(postsDir: string): Promise<Date> {
  const entries = await readdir(postsDir, { withFileTypes: true })
  let latest = new Date(0)
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const src = await readFile(join(postsDir, entry.name, 'index.mdx'), 'utf-8')
    const { data } = matter(src)
    const date: Date = data.updatedAt ?? data.createdAt
    if (date > latest) latest = date
  }
  return latest
}

function serializeHeaders(rules: Map<string, string[]>): string {
  return [...rules.entries()]
    .map(([path, headers]) => `${path}\n${headers.map((h) => `    ${h}`).join('\n')}`)
    .join('\n\n')
    .concat('\n')
}

export default function generateHeaders(): AstroIntegration {
  return {
    name: 'generate-headers',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const postsDir = new URL('../content/posts', import.meta.url).pathname
        const lastModified = truncateToSeconds(await getLatestPostDate(postsDir)).toUTCString()

        const rules = new Map<string, string[]>([
          [
            '/*',
            [
              "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self' https://*.algolia.net https://*.algolianet.com https://*.algolia.io; font-src 'self'; manifest-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'none';",
              'Referrer-Policy: strict-origin-when-cross-origin',
              'X-Frame-Options: DENY',
              'X-Content-Type-Options: nosniff',
              'X-DNS-Prefetch-Control: on',
              'Strict-Transport-Security: max-age=31536000; includeSubDomains',
              'Permissions-Policy: camera=(), microphone=(), geolocation=()',
            ],
          ],
          ['/_astro/*', ['cache-control: public, max-age=31536000, immutable']],
          ['/static/*', ['cache-control: public, max-age=31536000, immutable']],
          ['/atom.xml', [`Last-Modified: ${lastModified}`]],
        ])

        await writeFile(new URL('_headers', dir), serializeHeaders(rules))
      },
    },
  }
}
