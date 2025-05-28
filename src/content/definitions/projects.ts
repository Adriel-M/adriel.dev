import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

export default defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/projects' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      href: z.string(),
    }),
})
