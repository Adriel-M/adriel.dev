import { getCollection, getEntry } from 'astro:content'

import { generateGet } from '@/libs/generateOgGet.tsx'

export async function getStaticPaths() {
  const posts = await getCollection('posts')
  return posts.map((post) => ({
    params: { id: post.id },
  }))
}

export const { GET } = generateGet(async ({ id }) => {
  const post = await getEntry('posts', id!)!
  return post.data.title
})
