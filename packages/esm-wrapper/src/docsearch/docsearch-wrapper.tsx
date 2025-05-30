import type { DocSearchProps as DocSearchComponentProps } from '@docsearch/react'
import { DocSearch, version } from '@docsearch/react'
import React from 'react'
import { createRoot } from 'react-dom/client'

interface DocSearchProps extends DocSearchComponentProps {
  container: HTMLElement | string
  environment?: {
    document: Document
  }
}

function getHTMLElement(
  value: HTMLElement | string,
  environment: { document: Document } = { document: document }
): HTMLElement {
  if (typeof value === 'string') {
    return environment.document.querySelector(value)!
  }

  return value
}

export function docsearch(props: DocSearchProps): void {
  const container = getHTMLElement(props.container, props.environment)
  const root = createRoot(container)

  root.render(
    <DocSearch
      {...props}
      transformSearchClient={(searchClient) => {
        searchClient.addAlgoliaAgent('docsearch.js', version)

        return props.transformSearchClient
          ? props.transformSearchClient(searchClient)
          : searchClient
      }}
    />
  )
}
