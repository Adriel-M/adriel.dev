import fs from 'node:fs'
import path from 'node:path'

import type { Code, Root } from 'mdast'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

const FILE_REGEX = /file=([^\s]+)/
const TITLE_REGEX = /title=(?:"([^"]*)"|'([^']*)'|(\S+))/

function remarkIncludeCode() {
  return (tree: Root, file: VFile) => {
    visit(tree, 'code', (node: Code) => {
      if (!node.meta) return

      const fileMatch = node.meta.match(FILE_REGEX)
      if (!fileMatch) return

      const sourcePath = fileMatch[1]
      const dir = file.dirname ?? process.cwd()
      const fullPath = path.resolve(dir, sourcePath)
      const fileContent = fs.readFileSync(fullPath, 'utf-8')

      node.value = fileContent

      let meta = node.meta.replace(FILE_REGEX, '').trim()

      if (!TITLE_REGEX.test(meta)) {
        const title = path.basename(sourcePath)
        meta = meta ? `title="${title}" ${meta}` : `title="${title}"`
      }

      node.meta = meta
    })
  }
}

export default remarkIncludeCode
