import { Metadata } from 'next'

import siteMetadata from '@/lib/siteMetadata'

interface PageSEOProps {
  title: string
  description?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export function genPageMetadata({ title, description, ...rest }: PageSEOProps): Metadata {
  const ogImage = [`/og?title=${encodeURI(title)}`]
  return {
    title,
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      url: './',
      siteName: siteMetadata.title,
      images: ogImage,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      title: `${title} | ${siteMetadata.title}`,
      card: 'summary_large_image',
      images: ogImage,
    },
    ...rest,
  }
}
