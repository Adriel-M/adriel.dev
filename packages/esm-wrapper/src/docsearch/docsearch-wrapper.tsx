import type { DocSearchProps as DocSearchComponentProps } from '@docsearch/react'
import { DocSearch, version } from '@docsearch/react'
import React from 'react'
import { createRoot } from 'react-dom/client'

interface DocSearchProps extends DocSearchComponentProps {
  container: HTMLElement
}

export function docsearch(props: DocSearchProps): void {
  const root = createRoot(props.container)

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
