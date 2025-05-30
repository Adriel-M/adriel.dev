import { generateGet } from '@/libs/generateOgGet.tsx'
import { title } from '@/pages/about/index.astro'

export const { GET } = generateGet(title)
