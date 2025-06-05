import { select, Separator } from '@inquirer/prompts'

import Exit from './commands/Exit.ts'
import NewPost from './commands/NewPost.ts'
import UpdatePost from './commands/UpdatePost.ts'
import { setPath } from './paths.ts'

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length !== 1) {
    throw new Error(
      'Missing or too many arguments passed. Only pass in the path to the posts folder.'
    )
  }

  const folderPath = args[0]!
  setPath(folderPath)

  const command = await select({
    message: 'What do you want to do?',
    choices: [NewPost.choice, UpdatePost.choice, new Separator(), Exit.choice],
  })

  await command.run()
}

main()
