import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import matter from 'gray-matter'

const postsDir = new URL('../content/posts', import.meta.url).pathname

/**
 * Reads `updatedAt ?? createdAt` for every post straight from the filesystem,
 * keyed by post id (the `<YYYY-MM-DD>-<slug>` folder name, which is also the
 * route segment under `/posts/`).
 *
 * Build-time consumers here are integrations and integration options, which run
 * outside the module graph and so cannot import `astro:content`.
 */
export async function getPostDates(): Promise<Map<string, Date>> {
  const entries = await readdir(postsDir, { withFileTypes: true })
  const dates = new Map<string, Date>()

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const src = await readFile(join(postsDir, entry.name, 'index.mdx'), 'utf-8')
    const { data } = matter(src)
    dates.set(entry.name, data.updatedAt ?? data.createdAt)
  }

  return dates
}

export async function getLatestPostDate(): Promise<Date> {
  let latest = new Date(0)
  for (const date of (await getPostDates()).values()) {
    if (date > latest) latest = date
  }
  return latest
}
