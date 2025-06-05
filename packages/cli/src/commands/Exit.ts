import type CommandInterface from './CommandInterface.ts'
import type UpdatePostCommandInterface from './updatePost/UpdatePostCommandInterface.ts'

class Exit implements CommandInterface, UpdatePostCommandInterface {
  name = 'Exit'
  run(): Promise<void> {
    console.log('Exiting')
    process.exit()
  }
  choice: { name: string; value: CommandInterface } = { name: this.name, value: this }
}

const exit = new Exit()

export default exit
