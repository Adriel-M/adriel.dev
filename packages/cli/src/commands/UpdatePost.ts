import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

import { select, Separator } from '@inquirer/prompts'

import { getPath } from '../paths.ts'
import type CommandInterface from './CommandInterface.ts'
import Exit from './Exit.ts'
import CreatedAt from './updatePost/CreatedAt.ts'
import Title from './updatePost/Title.ts'
import UpdatedAt from './updatePost/UpdatedAt.ts'

const EXIT = 'Exit'

class UpdatePost implements CommandInterface {
  name = 'Update Post'
  async run(): Promise<void> {
    const postsFolder = join(process.cwd(), getPath())

    const files = await readdir(postsFolder)
    const sortedFileNmaes = files.sort().reverse()

    const postName = (await select({
      message: 'Which file do you want to update?',
      choices: [...sortedFileNmaes, new Separator(), EXIT],
    })) as string

    if (postName === EXIT) {
      process.exit()
    }

    const field = await select({
      message: 'Which field do you want to update?',
      choices: [CreatedAt.choice, UpdatedAt.choice, Title.choice, new Separator(), Exit.choice],
    })

    await field.run(postsFolder, postName)
  }

  choice: { name: string; value: CommandInterface } = { name: this.name, value: this }
}

const updatePost = new UpdatePost()

export default updatePost
