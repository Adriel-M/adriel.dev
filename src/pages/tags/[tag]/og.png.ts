import { getTagCounts } from '@/libs/CollectionUtils.ts'
import { generateGet } from '@/libs/generateOgGet.tsx'

export async function getStaticPaths() {
  const tagCounts = await getTagCounts()
  const tags = Object.keys(tagCounts)
  return tags.map((tag) => ({
    params: { tag },
  }))
}

export const { GET } = generateGet(({ tag }) => {
  return tag!.toUpperCase()
})
