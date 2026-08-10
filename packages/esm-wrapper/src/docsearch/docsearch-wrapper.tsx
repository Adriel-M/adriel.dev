import { DocSearch as DocSearchProvider, useDocSearch } from '@docsearch/core'
import type { DocSearchProps as DocSearchComponentProps } from '@docsearch/react'
import { DocSearchButton } from '@docsearch/react/button'
import { DocSearchModal } from '@docsearch/react/modal'
import { version } from '@docsearch/react/version'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'

interface DocSearchProps extends DocSearchComponentProps {
  container: HTMLElement
}

type DocSearchInnerProps = Omit<DocSearchComponentProps, 'apiKey' | 'appId'>

function DocSearch({ apiKey, appId, ...props }: DocSearchComponentProps) {
  return (
    <DocSearchProvider {...props} apiKey={apiKey} appId={appId}>
      <DocSearchInner {...props} />
    </DocSearchProvider>
  )
}

function DocSearchInner(props: DocSearchInnerProps) {
  const {
    apiKey,
    appId,
    closeModal,
    initialQuery,
    isModalActive,
    keyboardShortcuts,
    openModal,
    searchButtonRef,
  } = useDocSearch()

  if (!appId || !apiKey) {
    throw new Error('`DocSearch` requires `appId` and `apiKey` props.')
  }

  return (
    <>
      <DocSearchButton
        keyboardShortcuts={keyboardShortcuts}
        ref={searchButtonRef}
        translations={props.translations?.button}
        onClick={openModal}
      />
      {isModalActive &&
        createPortal(
          <DocSearchModal
            {...props}
            apiKey={apiKey}
            appId={appId}
            initialQuery={initialQuery}
            initialScrollY={window.scrollY}
            translations={props.translations?.modal}
            onClose={closeModal}
          />,
          props.portalContainer ?? document.body
        )}
    </>
  )
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
