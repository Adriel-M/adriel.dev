import { Feed } from 'feed'

import atomStyleUrl from '@/assets/feed/atom-style.js?url'
import { getPosts } from '@/libs/CollectionUtils'
import { truncateToSeconds } from '@/libs/DateUtils'
import generateSummary from '@/libs/generate-summary'
import siteConfig from '@/libs/siteConfig'
import { URLS } from '@/libs/UrlLibs.ts'

const copyrightNotice =
  'Copyright Adriel Martinez. Some rights reserved. Licensed under CC BY 4.0: http://creativecommons.org/licenses/by/4.0/'

const author = {
  name: siteConfig.author,
  email: 'contact@websiteDomain',
}

export async function GET({ request }: { request: Request }) {
  const siteUrl = new URL(request.url).origin
  const posts = await getPosts()
  const postAndSummaries = await Promise.all(
    posts.map(async (post) => {
      const summary = await generateSummary(post.body!)
      return {
        post,
        summary,
      }
    })
  )

  const latestUpdate =
    posts.length > 0
      ? posts.reduce<Date>((max, post) => {
          const date = post.data.updatedAt ?? post.data.createdAt
          return date > max ? date : max
        }, new Date(0))
      : undefined

  const title = siteConfig.title
  const feed = new Feed({
    title,
    description: siteConfig.description,
    id: siteUrl,
    link: siteUrl,
    language: siteConfig.locale,
    updated: latestUpdate ? truncateToSeconds(latestUpdate) : undefined,
    feedLinks: {
      atom: `${siteUrl}${URLS.ATOM}`,
    },
    author: author,
    copyright: copyrightNotice,
  })

  for (const postAndSummary of postAndSummaries) {
    const { post, summary } = postAndSummary

    feed.addItem({
      title: post.data.title,
      id: `${siteUrl}/posts/${post.id}`,
      link: `${siteUrl}/posts/${post.id}`,
      description: summary,
      date: truncateToSeconds(post.data.updatedAt ?? post.data.createdAt),
      published: truncateToSeconds(post.data.createdAt),
      author: [author],
    })
  }

  const xml = feed
    .atom1()
    .replace(
      /(<feed[^>]*>)/,
      `$1\n<script src="${atomStyleUrl}" data-fallback-logo="/static/feed/RssStyleFavicon.svg" xmlns="http://www.w3.org/1999/xhtml"></script>`
    )

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
