import { runSync } from '@mdx-js/mdx'
import { ComponentType } from 'react'
import * as runtime from 'react/jsx-runtime'

import Image from '@/components/Image'
import Link from '@/components/Link'
import TableWrapper from '@/components/TableWrapper'

const globalComponents = {
  Image,
  a: Link,
  table: TableWrapper,
}

const runComponent = (code: string) => {
  return runSync(code, {
    ...runtime,
  }).default
}

interface MDXProps {
  content: { code: string }
  components?: Record<string, ComponentType>
  [key: string]: unknown
}

// MDXContent component
export const MDXContent = ({ content, components, ...rest }: MDXProps) => {
  const Component = runComponent(content.code)
  return <Component components={{ ...globalComponents, ...components }} {...rest} />
}
