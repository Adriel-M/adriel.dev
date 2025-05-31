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

const XML_CONTENT_TO_REPLACE = '<?xml version="1.0" encoding="utf-8"?>'

export async function GET(context: { url: URL }) {
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
  console.log(context.url)

  const title = siteConfig.title
  const feed = new Feed({
    title,
    description: siteConfig.description,
    id: siteConfig.siteUrl,
    link: siteConfig.siteUrl,
    language: siteConfig.locale,
    favicon: `${siteConfig.siteUrl}/static/favicons/favicon.ico`,
    updated: posts.length > 0 ? posts[0].data.createdAt : undefined,
    feedLinks: {
      rss: `${siteConfig.siteUrl}${URLS.RSS}`,
    },
    author: author,
    copyright: copyrightNotice,
  })

  for (const postAndSummary of postAndSummaries) {
    const { post, summary } = postAndSummary

    feed.addItem({
      title: post.data.title,
      id: `${siteConfig.siteUrl}/posts/${post.id}`,
      link: `${siteConfig.siteUrl}/posts/${post.id}`,
      description: summary,
      date: post.data.createdAt,
      author: [author],
      category: post.data.tags.map((sluggedTag) => ({
        name: sluggedTag.tag,
        domain: `${siteConfig.siteUrl}${generateTagsPath(sluggedTag)}`,
      })),
    })
  }

  const rssString = feed.rss2()

  const styleInstruction = '<?xml-stylesheet href="/static/rss/simple-rss.xslt" type="text/xsl"?>'

  const styled = rssString.replace(
    XML_CONTENT_TO_REPLACE,
    XML_CONTENT_TO_REPLACE + '\n' + styleInstruction
  )

  return new Response(styled, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
