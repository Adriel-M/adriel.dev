import 'css/prism.css'

import { allBlogs } from 'contentlayer/generated'
import { Metadata } from 'next'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { sortPosts } from 'pliny/utils/contentlayer'

import { components } from '@/components/MDXComponents'
import siteMetadata from '@/data/siteMetadata'
import PostSimple from '@/layouts/PostSimple'

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] }
}): Promise<Metadata | undefined> {
  const slug = decodeURI(params.slug.join('/'))
  const post = allBlogs.find((p) => p.slug === slug)
  if (!post) {
    return
  }

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const imageList = [siteMetadata.socialBanner]
  const ogImages = imageList.map((img) => {
    return {
      url: img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
      authors: [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const dynamicParams = false

export const generateStaticParams = async () => {
  return allBlogs.map((p) => ({ slug: p.slug.split('/') }))
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const slug = decodeURI(params.slug.join('/'))

  const sortedPosts = sortPosts(allBlogs)
  const postIndex = sortedPosts.findIndex((p) => p.slug === slug)

  const prev = sortedPosts[postIndex + 1]
  const next = sortedPosts[postIndex - 1]
  const post = sortedPosts[postIndex]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(post.structuredData) }}
      />
      <PostSimple content={post} next={next} prev={prev}>
        <MDXLayoutRenderer code={post.body.code} components={components} />
      </PostSimple>
    </>
  )
}
