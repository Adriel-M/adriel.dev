import fs from 'fs'
import { ImageNode } from 'pliny/mdx-plugins/index.js'
import { sync as sizeOf } from 'probe-image-size'
import { Node, Parent } from 'unist'
import { visit } from 'unist-util-visit'

/**
 * MIT License
 *
 * Copyright (c) 2021 Timothy Lin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// original license can be found here https://github.com/timlrx/pliny/blob/main/LICENSE

// copy of remarkImgToJsx from pliny but changing the path from public... to
// image...
export const remarkImgToJsx = () => {
  return (tree: Node) => {
    visit(
      tree,
      // only visit p tags that contain an img element
      (node: Parent): node is Parent =>
        node.type === 'paragraph' && node.children.some((n) => n.type === 'image'),
      (node: Parent) => {
        const imageNodeIndex = node.children.findIndex((n) => n.type === 'image')
        const imageNode = node.children[imageNodeIndex] as ImageNode

        const path = process.cwd() + imageNode.url
        // only local files
        if (fs.existsSync(path)) {
          const dimensions = sizeOf(fs.readFileSync(path))

          // Convert original node to next/image
          ;(imageNode.type = 'mdxJsxFlowElement'),
            (imageNode.name = 'Image'),
            (imageNode.attributes = [
              { type: 'mdxJsxAttribute', name: 'alt', value: imageNode.alt },
              { type: 'mdxJsxAttribute', name: 'src', value: imageNode.url },
              { type: 'mdxJsxAttribute', name: 'width', value: dimensions!.width },
              { type: 'mdxJsxAttribute', name: 'height', value: dimensions!.height },
            ])
          // Change node type from p to div to avoid nesting error
          node.type = 'div'
          node.children[imageNodeIndex] = imageNode
        }
      }
    )
  }
}
