import { writeFileSync } from 'fs'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { rehypeGithubAlerts } from 'rehype-github-alerts'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGemoji from 'remark-gemoji'
import { defineConfig } from 'velite'

import { sortPosts } from '@/lib/PlinyUtils'
import rehypeAutolinkHeadingsConfig from '@/lib/rehypeConfigs/RehypeAutolinkHeadingsConfig'
import rehypeGithubAlertsConfig from '@/lib/rehypeConfigs/RehypeGithubAlertsConfig'
import rehypePrettyCodeConfig from '@/lib/rehypeConfigs/RehypePrettyCodeConfig'
import remarkImgToJsx from '@/lib/remarkPlugins/RemarkImgToJsx'
import remarkTitleCase from '@/lib/remarkPlugins/RemarkTitleCase'
import getFeed from '@/lib/Rss'
import AuthorCollection from '@/veliteCollections/AuthorCollection'
import PostCollection from '@/veliteCollections/PostCollection'
import ProjectCollection from '@/veliteCollections/ProjectCollection'
import TagCollection from '@/veliteCollections/TagCollection'

const config = defineConfig({
  strict: true,
  collections: {
    author: AuthorCollection,
    posts: PostCollection,
    projects: ProjectCollection,
    tags: TagCollection,
  },
  mdx: {
    gfm: true,
    remarkPlugins: [remarkGemoji, remarkImgToJsx, remarkTitleCase],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, rehypeAutolinkHeadingsConfig],
      [rehypePrettyCode, rehypePrettyCodeConfig],
      [rehypeGithubAlerts, rehypeGithubAlertsConfig],
    ],
    copyLinkedFiles: false,
    removeComments: true,
    minify: true,
  },
  output: {
    assets: 'public/velite',
    base: '/velite/',
  },
  prepare: (collections) => {
    // sort posts on content build time so we don't have to manually sort
    // in the actual page implementation.
    Object.assign(collections, {
      posts: sortPosts(collections.posts),
    })
    const { posts, tags } = collections
    const tagCount: Record<string, number> = {}
    posts.forEach((post) => {
      post.tags.forEach((sluggedTag) => {
        if (!(sluggedTag.tag in tagCount)) {
          tagCount[sluggedTag.tag] = 0
        }

        tagCount[sluggedTag.tag] += 1
      })
    })

    tags.push({
      counts: tagCount,
    })
  },
  complete: ({ posts }) => {
    const feed = getFeed(posts)

    writeFileSync('./public/rss.xml', feed.rss2())
    writeFileSync('./public/atom.xml', feed.atom1())
  },
})

export default config
