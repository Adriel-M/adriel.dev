import rss from '@astrojs/rss'

import { getPosts } from '@/libs/CollectionUtils'
import generateSummary from '@/libs/generate-summary'
import siteConfig from '@/libs/siteConfig'

export async function GET(context: { site: string }) {
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
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site,
    trailingSlash: false,
    stylesheet: '/static/rss/pretty-feed-v3.xsl',
    items: postAndSummaries.map((postAndSummary) => {
      const { post, summary } = postAndSummary
      return {
        title: post.data.title,
        pubDate: post.data.createdAt,
        description: summary,
        link: `/posts/${post.id}`,
        categories: post.data.tags.map((tag) => tag.tag),
      }
    }),
  })
}
