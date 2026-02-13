import { Feed } from 'feed'

import { getPosts } from '@/libs/CollectionUtils'
import generateSummary from '@/libs/generate-summary'
import siteConfig from '@/libs/siteConfig'
import { generateTagsPath, URLS } from '@/libs/UrlLibs.ts'

const copyrightNotice =
  'Copyright Adriel Martinez. Some rights reserved. Licensed under CC BY 4.0: http://creativecommons.org/licenses/by/4.0/'

const author = {
  name: siteConfig.author,
  email: 'contact@websiteDomain',
}

export async function GET() {
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

  const title = siteConfig.title
  const feed = new Feed({
    title,
    description: siteConfig.description,
    id: import.meta.env.SITE,
    link: import.meta.env.SITE,
    language: siteConfig.locale,
    favicon: `${import.meta.env.SITE}/static/favicons/favicon.ico`,
    updated: posts.length > 0 ? posts[0].data.createdAt : undefined,
    feedLinks: {
      atom: `${import.meta.env.SITE}${URLS.ATOM}`,
    },
    author: author,
    copyright: copyrightNotice,
    stylesheet: '/static/feed/simple-atom.xslt',
  })

  for (const postAndSummary of postAndSummaries) {
    const { post, summary } = postAndSummary

    feed.addItem({
      title: post.data.title,
      id: `${import.meta.env.SITE}/posts/${post.id}`,
      link: `${import.meta.env.SITE}/posts/${post.id}`,
      description: summary,
      date: post.data.createdAt,
      author: [author],
      category: post.data.tags.map((sluggedTag) => ({
        name: sluggedTag.tag,
        domain: `${import.meta.env.SITE}${generateTagsPath(sluggedTag)}`,
      })),
    })
  }

  return new Response(feed.atom1(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
