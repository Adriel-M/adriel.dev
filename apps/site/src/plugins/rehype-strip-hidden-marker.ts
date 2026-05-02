import type { Element, Root, Text } from 'hast'
import { visit } from 'unist-util-visit'

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

function rehypeStripHiddenMarker() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (!HEADING_TAGS.has(node.tagName)) return

      const firstChild = node.children.at(0)
      if (firstChild?.type !== 'text') return

      const text = (firstChild as Text).value
      if (!text.toLowerCase().startsWith(':hidden')) return
      ;(firstChild as Text).value = text.replace(/^:hidden/i, '').trimStart()
      if (!(firstChild as Text).value) node.children.shift()

      node.properties = node.properties ?? {}
      node.properties.dataHidden = ''
    })
  }
}

export default rehypeStripHiddenMarker
