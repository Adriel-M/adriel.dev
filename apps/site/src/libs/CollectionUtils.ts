import { type CollectionEntry, getCollection } from 'astro:content'

const postSortFun = (a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>): number => {
  if (a.data.createdAt > b.data.createdAt) return -1
  if (a.data.createdAt < b.data.createdAt) return 1

  return 0
}
export const getPosts = async (): Promise<CollectionEntry<'posts'>[]> => {
  const posts = await getCollection('posts')

  return posts.sort(postSortFun)
}

export const generatePostPath = (post: CollectionEntry<'posts'>): string => {
  return `/posts/${post.id}`
}
