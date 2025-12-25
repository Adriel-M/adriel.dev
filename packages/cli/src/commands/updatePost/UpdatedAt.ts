import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import matter from 'gray-matter'

import type UpdatePostCommandInterface from './UpdatePostCommandInterface.ts'

class UpdatedAt implements UpdatePostCommandInterface {
  name = 'updatedAt'

  async run(postsFolder: string, postName: string): Promise<void> {
    const filePath = join(postsFolder, postName, 'index.mdx')
    const fileContent = await readFile(filePath, 'utf-8')

    const { content, data } = matter(fileContent)

    data.updatedAt = new Date()

    await writeFile(filePath, matter.stringify(content, data), 'utf-8')

    console.log(`Updated ${postName}`)
  }

  choice: { name: string; value: UpdatePostCommandInterface } = { name: this.name, value: this }
}

const updatedAt = new UpdatedAt()

export default updatedAt
