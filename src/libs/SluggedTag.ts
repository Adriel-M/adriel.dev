import { slug } from 'github-slugger'

export interface SluggedTag {
  tag: string
}

export const generateSluggedTag = (tag: string): SluggedTag => {
  return { tag: slug(tag) }
}
