import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

export default defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: () =>
    z.object({
      title: z.string(),
      createdAt: z.date(),
      updatedAt: z.date().optional(),
    }),
})
