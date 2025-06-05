import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

import { generateSluggedTag } from '@/libs/SluggedTag.ts'

export default defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: () =>
    z.object({
      title: z.string(),
      tags: z
        .array(z.string())
        .superRefine((tags, { addIssue }) => {
          const seenTags = new Set<string>()
          const duplicateTags = new Set<string>()

          for (const tag of tags) {
            if (seenTags.has(tag)) {
              duplicateTags.add(tag)
            }
            seenTags.add(tag)
          }

          if (duplicateTags.size > 0) {
            addIssue({
              code: 'custom',
              message: `Duplicate tags found: ${[...duplicateTags]}`,
            })

            return z.NEVER
          }
        })
        .transform((tags) => tags.map(generateSluggedTag)),
      createdAt: z.date(),
      updatedAt: z.date().optional(),
    }),
})
