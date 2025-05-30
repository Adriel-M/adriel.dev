import { generateGet } from '@/libs/generateOgGet.tsx'
import { title } from '@/pages/license/index.astro'

export const { GET } = generateGet(title)
