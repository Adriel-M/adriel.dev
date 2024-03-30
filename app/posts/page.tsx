import { genPageMetadata } from 'app/seo'
import { allPosts } from 'contentlayer/generated'

import PagedListLayoutWithTags from '@/layouts/PagedListLayoutWithTags'
import { sortPosts } from '@/lib/PlinyUtils'

export const metadata = genPageMetadata({ title: 'Posts' })

export default function Page() {
  const posts = sortPosts(allPosts)

  return <PagedListLayoutWithTags posts={posts} title="All Posts" pageNumber={1} />
}
