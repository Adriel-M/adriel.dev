import 'css/tailwind.css'
import 'css/post-layout.css'

import { JetBrains_Mono } from 'next/font/google'
import { Analytics, AnalyticsConfig } from 'pliny/analytics'
import Header from '@/components/Header'
import SectionContainer from '@/components/SectionContainer'
import Footer from '@/components/Footer'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from './theme-providers'
import { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { KBarConfig, KBarSearchProvider } from 'pliny/search/KBar'

const jetbrains_mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: '500',
  variable: '--font-space-jebtrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/rss.xml`,
      'application/atom+xml': `${siteMetadata.siteUrl}/feed.xml`,
      'application/feed+json': `${siteMetadata.siteUrl}/feed.json`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchConfig = siteMetadata.search as KBarConfig
  return (
    <html
      lang={siteMetadata.language}
      className={`${jetbrains_mono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/favicon-16x16.png" />
      <link rel="manifest" href="/static/favicons/site.webmanifest" />
      <link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
      <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
      <link rel="alternate" type="application/atom+xml" href="/feed.xml" />
      <link rel="alternate" type="application/feed+json" href="/feed.json" />
      <body className="bg-white text-black antialiased">
        <ThemeProviders>
          <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
          <SpeedInsights />
          <SectionContainer>
            <div className="flex h-screen flex-col justify-between font-monospace">
              <KBarSearchProvider kbarConfig={searchConfig.kbarConfig}>
                <Header />
                <main className="mb-auto">{children}</main>
              </KBarSearchProvider>
              <Footer />
            </div>
          </SectionContainer>
        </ThemeProviders>
      </body>
    </html>
  )
}
