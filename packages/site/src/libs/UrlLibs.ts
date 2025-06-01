import type { SluggedTag } from '@/libs/SluggedTag.ts'

const TAGS_BASE_PATH = '/tags/'

export const generateTagsPath = (tag: SluggedTag): string => {
  return `${TAGS_BASE_PATH}${tag.tag}`
}
export const URLS = {
  HOME: '/',
  POSTS: '/posts',
  PROJECTS: '/projects',
  ABOUT: '/about',
  ATOM: '/atom.xml',
}
