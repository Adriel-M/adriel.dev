import nlp from 'compromise'
import { toString } from 'mdast-util-to-string'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import type { Node, Parent } from 'unist'
import { SKIP, visit } from 'unist-util-visit'

import siteConfig from '@/libs/siteConfig'

const whitespaceRegex = /\s+/g
const footnoteReferenceRegex = /\[\^\w+\]/g

const exclusionType = ['blockquote', 'footnoteReference', 'footnoteDefinition']

const cleanAST =
  () =>
  (tree: Node): void => {
    visit(tree, (node: Node, index: number | undefined, parent: Parent) => {
      if (!parent || typeof index !== 'number') return

      if (exclusionType.includes(node.type)) {
        ;(parent as Parent).children.splice(index, 1)
        return [SKIP, index]
      }
    })
  }

const extractFirstSectionText = () => {
  return (tree: Parent) => {
    const paragraphNodes: Node[] = []
    visit(tree, 'paragraph', (_, index: number, parent: Parent) => {
      if (paragraphNodes.length > 0) return

      // get me all the children until the next heading
      for (let i = index; i < parent.children.length; i++) {
        if (parent.children[i].type === 'heading') break

        paragraphNodes.push(parent.children[i])
      }
    })

    if (paragraphNodes) {
      tree.type = 'root'
      tree.children = paragraphNodes
    }
  }
}

const extractPlainText = (tree: Node): string => {
  const paragraphs: string[] = []

  visit(tree, 'paragraph', (node: Node) => {
    const text = toString(node)
      .replace(footnoteReferenceRegex, '')
      .replace(whitespaceRegex, ' ')
      .trim()
    if (text) {
      paragraphs.push(text)
    }
  })

  return paragraphs.join('\n\n')
}

const summarizeFullSentences = (text: string, wordLimit: number): string => {
  const sentences = nlp(text).sentences().json()
  let currentNumberOfWords = 0
  const output: string[] = []
  for (const sentence of sentences) {
    output.push(sentence.text)
    currentNumberOfWords += sentence.terms.length
    if (currentNumberOfWords >= wordLimit) {
      break
    }
  }
  return output.join(' ')
}

const processor = remark().use(remarkMdx).use(cleanAST).use(extractFirstSectionText)

export default async function generateSummary(markdownContent: string): Promise<string> {
  const parsed = processor.parse(markdownContent)
  const tree = await processor.run(parsed)

  const plainText = extractPlainText(tree)
  return summarizeFullSentences(plainText, siteConfig.postSummaryLength)
}
