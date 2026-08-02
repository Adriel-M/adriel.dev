import { writeFile } from 'node:fs/promises'

import type { AstroIntegration } from 'astro'

import { truncateToSeconds } from '../libs/DateUtils'
import { getLatestPostDate } from './post-dates'

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
        const lastModified = truncateToSeconds(await getLatestPostDate()).toUTCString()

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
