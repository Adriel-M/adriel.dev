import { generateGet } from '@/libs/generateOgGet.tsx'
import { title } from '@/pages/index.astro'

export const { GET } = generateGet(title)
