import { generateGet } from '@/libs/generateOgGet.tsx'
import { title } from '@/pages/projects/index.astro'

export const { GET } = generateGet(title)
