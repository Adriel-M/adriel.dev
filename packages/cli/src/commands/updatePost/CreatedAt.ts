import { readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { slug } from 'github-slugger'
import matter from 'gray-matter'

import { getDateString } from '../../date-utils.ts'
import type UpdatePostCommandInterface from './UpdatePostCommandInterface.ts'

class CreatedAt implements UpdatePostCommandInterface {
  name = 'createdAt'

  async run(postsFolder: string, postName: string): Promise<void> {
    const folderPath = join(postsFolder, postName)
    const filePath = join(folderPath, 'index.mdx')

    const fileContent = await readFile(filePath, 'utf-8')

    const { content, data } = matter(fileContent)

    data.createdAt = new Date()
    delete data.updatedAt

    const nowDateString = getDateString(new Date())

    // overwrite original file
    await writeFile(filePath, matter.stringify(content, data), 'utf-8')

    const targetFolderName = `${nowDateString}-${slug(data.title)}`
    const targetFolderPath = join(postsFolder, targetFolderName)

    if (targetFolderName !== postName) {
      await rename(folderPath, targetFolderPath)
    }

    console.log(`Updated ${targetFolderName}`)
  }

  choice: { name: string; value: UpdatePostCommandInterface } = { name: this.name, value: this }
}

const createdAt = new CreatedAt()

export default createdAt
