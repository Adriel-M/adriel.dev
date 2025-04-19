import '@/css/user-content.css'

import { genPageMetadata } from 'app/seo'

import PageSimple from '@/app/PageSimple'
import { MDXContent } from '@/components/mdx-content'
import ObfuscatedEmail from '@/components/ObfuscatedEmail'
import siteConfig from '@/lib/siteConfig'
import { author } from '#veliteContent'

const title = 'About'
export const metadata = genPageMetadata({ title })

export default function Page() {
  return (
    <>
      <PageSimple title={title}>
        <MDXContent
          content={author}
          components={{ ObfuscatedEmail }}
          emailAddress={siteConfig.emailAddress}
        />
      </PageSimple>
    </>
  )
}
