import { MetadataRoute } from 'next'

import siteMetadata from '@/data/siteMetadata'
import { getAllPosts } from '@/lib/CollectionUtils'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = getAllPosts().map((post) => ({
    url: `${siteUrl}/${post.path}`,
    lastModified: post.lastmod || post.date,
  }))

  const now = new Date().toISOString().split('T')[0]

  const routes = ['', 'posts', 'projects', 'about'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: now,
  }))

  return [...routes, ...blogRoutes]
}
