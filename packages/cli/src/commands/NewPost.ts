import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { input } from '@inquirer/prompts'
import { slug } from 'github-slugger'
import matter from 'gray-matter'

import { getDateString } from '../date-utils.ts'
import { getPath } from '../paths.ts'
import type CommandInterface from './CommandInterface.ts'

class NewPost implements CommandInterface {
  name = 'New Post'
  async run(): Promise<void> {
    const title = await input({ message: 'Title of Post?' })

    const now = new Date()
    const date = getDateString(now)
    const folderName = `${date}-${slug(title)}`
    const targetFolder = join(process.cwd(), getPath(), folderName)

    await mkdir(targetFolder)

    const frontMatter = {
      title,
      createdAt: now,
      tags: ['tag'],
    }

    const mdxPath = join(targetFolder, 'index.mdx')

    await Bun.write(mdxPath, matter.stringify('content body', frontMatter))

    console.log(`Created new post at ${targetFolder}`)
  }

  choice: { name: string; value: CommandInterface } = { name: this.name, value: this }
}

const newPost = new NewPost()

export default newPost
