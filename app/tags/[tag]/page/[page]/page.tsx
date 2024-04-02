import tagData from '@/app/tag-data.json'
import PagedListLayoutWithTags from '@/layouts/PagedListLayoutWithTags'
import { getPostsByTagSlug } from '@/lib/CollectionUtils'
import { getTotalPages } from '@/lib/PagingUtils'
import { sortPosts } from '@/lib/PlinyUtils'

interface TagAndPage {
  tag: string
  page: string
}
export const dynamicParams = false

export function generateStaticParams() {
  const entries: TagAndPage[] = []

  for (const [tag, count] of Object.entries(tagData)) {
    const numberOfPages = getTotalPages(count)

    for (let i = 0; i < numberOfPages; i++) {
      entries.push({
        tag,
        page: (i + 1).toString(),
      })
    }
  }

  return entries
}

export default function Page({ params }: { params: { page: string; tag: string } }) {
  const pageNumber = parseInt(params.page as string)

  const tag = params.tag

  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)

  const filteredPosts = sortPosts(getPostsByTagSlug(tag))

  return (
    <PagedListLayoutWithTags
      posts={filteredPosts}
      title={title}
      pageNumber={pageNumber}
      currentTag={tag}
    />
  )
}
