import type { MarkdownHeading } from 'astro'
import { useEffect, useRef, useState } from 'react'

import { throttle } from '@/libs/FunctionUtils.ts'

interface Props {
  headings: MarkdownHeading[]
}

interface TocEntry {
  slug: string
  text: string
  depth: number
  items: TocEntry[]
}

function generateTocEntry(headings: MarkdownHeading[]): TocEntry[] {
  const topLevel: TocEntry = {
    slug: '',
    text: '',
    depth: 0,
    items: [],
  }
  const insertTo: TocEntry[] = [topLevel]

  for (const heading of headings) {
    const entry: TocEntry = {
      ...heading,
      items: [],
    }

    // find out which entry to push into
    // find the entry that is a depth right above it (currentDepth - 1)
    const targetDepth = entry.depth - 1
    while (insertTo[insertTo.length - 1].depth > targetDepth) {
      insertTo.pop()
    }

    // add self to that entry
    insertTo[insertTo.length - 1].items.push(entry)

    // we are now a candidate to have children
    insertTo.push(entry)
  }

  return insertTo[0].items
}

const TocEntryList = ({ activeSlug, entries }: { activeSlug: string; entries: TocEntry[] }) => {
  if (entries.length === 0) return

  const depth = entries[0].depth
  const isNested = depth > 0

  const borderCss = isNested ? 'pl-2 border-l-2 border-gray-200/25' : ''

  return (
    <ul className={borderCss}>
      {entries.map((entry, index) => {
        // (if no active [say from page load], set the first as active
        // else set the active when matching the section url
        const isActive = (!activeSlug && !isNested && index === 0) || entry.slug === activeSlug

        const activeCss = isActive ? 'text-primary-500' : ''
        return (
          <li className="list-inside list-disc" key={entry.slug}>
            <a
              className={'hover:text-primary-600 no-underline ' + activeCss}
              href={`#${entry.slug}`}
            >
              {entry.text}
            </a>
            <TocEntryList activeSlug={activeSlug} entries={entry.items} />
          </li>
        )
      })}
    </ul>
  )
}

export default function FloatingToc({ headings }: Props) {
  const [activeSlug, setActiveSlug] = useState(headings[0].slug)

  const headerElements = useRef<HTMLElement[]>([])

  useEffect(() => {
    headerElements.current = headings.map((heading) => {
      return document.getElementById(heading.slug)!
    })
  }, [headings])

  useEffect(() => {
    const handleScroll = () => {
      let slug = ''
      for (const headerElement of headerElements.current) {
        const rect = headerElement.getBoundingClientRect()
        if (rect.top <= 10) {
          slug = headerElement.id
        }
      }
      if (slug) {
        setActiveSlug(slug)
      }
    }

    const throttledHandleScroll = throttle(handleScroll)

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [])

  const nestedEntries = generateTocEntry(headings)
  return (
    <div className="w-toc-2xl xl:w-toc-5xl sticky top-20 float-right hidden h-0 px-8 text-xs lg:block">
      <div className="pb-2 text-sm">Table of Contents</div>
      <TocEntryList activeSlug={activeSlug} entries={nestedEntries} />
    </div>
  )
}
