import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

function rehypeHideHeading() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (!HEADING_TAGS.has(node.tagName)) return
      if (node.properties?.dataHidden === undefined) return

      const classes = (node.properties?.className as string[] | undefined) ?? []
      node.properties = node.properties ?? {}
      node.properties.className = [...classes, 'hidden-heading']
    })
  }
}

export default rehypeHideHeading
