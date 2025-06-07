import fg from 'fast-glob'
import fs from 'fs/promises'
import matter from 'gray-matter'
import type { Heading } from 'mdast'
import path from 'path'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { retext } from 'retext'
import retextEnglish from 'retext-english'
import retextIndefiniteArticle from 'retext-indefinite-article'
import retextRedundantAcronyms from 'retext-redundant-acronyms'
import retextRepeatedWords from 'retext-repeated-words'
import retextSentenceSpacing from 'retext-sentence-spacing'
import { titleCase } from 'title-case'
import { visit } from 'unist-util-visit'
import { describe, expect, it } from 'vitest'

const POSTS_PATH = '../content/posts'

const proofreadingProcessor = retext()
  .use(retextEnglish)
  .use(retextIndefiniteArticle)
  .use(retextRedundantAcronyms)
  .use(retextRepeatedWords)
  .use(retextSentenceSpacing)

const titleCaseProcessor = remark().use(remarkMdx)

describe('verify mdx content', async () => {
  const mdxFiles = await fg('**/*.mdx', {
    cwd: path.resolve(__dirname, POSTS_PATH),
    absolute: true,
  })
  for (const filePath of mdxFiles) {
    const pathSplit = filePath.split('/')
    const slug = pathSplit[pathSplit.length - 2]
    const content = await fs.readFile(filePath, 'utf-8')

    describe(slug, () => {
      it('passes proofreading', async () => {
        const file = await proofreadingProcessor.process(content)

        const messages = file.messages

        if (messages.length > 0) {
          console.warn(`Issues found in ${filePath}`)
          for (const message of messages) {
            console.warn(message)
          }
        }
        expect(messages.length).toBe(0)
      })

      it('has proper post title title casing', () => {
        const { data } = matter(content)
        const { title } = data
        expect(title).toBe(titleCase(title))
      })

      it('has proper heading title casing', async () => {
        const tree = titleCaseProcessor.parse(content)

        const headings: string[] = []

        visit(tree, 'heading', (node: Heading) => {
          const text = node.children.map((child) => ('value' in child ? child.value : '')).join('')
          headings.push(text)
        })

        for (const heading of headings) {
          expect(heading).toBe(titleCase(heading))
        }
      })
    })
  }
})
