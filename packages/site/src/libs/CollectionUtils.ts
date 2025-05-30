import { type CollectionEntry, getCollection } from 'astro:content'

import type { SluggedTag } from '@/libs/SluggedTag.ts'

const postSortFun = (a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>): number => {
  if (a.data.createdAt > b.data.createdAt) return -1
  if (a.data.createdAt < b.data.createdAt) return 1

  return 0
}
export const getPosts = async (): Promise<CollectionEntry<'posts'>[]> => {
  const posts = await getCollection('posts')

  return posts.sort(postSortFun)
}

export const getPostsByTag = (
  posts: CollectionEntry<'posts'>[],
  sluggedTag: SluggedTag
): CollectionEntry<'posts'>[] => {
  return posts
    .filter((post) => post.data.tags.some((t) => t.tag === sluggedTag.tag))
    .sort(postSortFun)
}

export const generatePostPath = (post: CollectionEntry<'posts'>): string => {
  return `/posts/${post.id}`
}

const tagSortAlphaFn = (a: SluggedTag, b: SluggedTag) => a.tag.localeCompare(b.tag)

export const sortTagsByAlpha = (tags: SluggedTag[]): SluggedTag[] => {
  return tags.sort(tagSortAlphaFn)
}

export const getTagCounts = async (): Promise<Record<string, number>> => {
  const posts = await getCollection('posts')

  const tagAndCounts: Record<string, number> = {}

  for (const post of posts) {
    for (const sluggedTag of post.data.tags) {
      const { tag } = sluggedTag
      if (!(tag in tagAndCounts)) {
        tagAndCounts[tag] = 0
      }
      tagAndCounts[tag] += 1
    }
  }
  return tagAndCounts
}
