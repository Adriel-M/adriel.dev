import { useEffect, useRef, useState } from 'react'

import { throttle } from '@/libs/FunctionUtils.ts'

interface Props {
  slugs: string[]
  entries: TocEntry[]
}

export interface TocEntry {
  slug: string
  text: string
  depth: number
  items: TocEntry[]
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
              className={'no-underline hover:text-primary-400 ' + activeCss}
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

export default function FloatingToc({ slugs, entries }: Props) {
  const [activeSlug, setActiveSlug] = useState(slugs[0])

  const headerElements = useRef<HTMLElement[]>([])

  useEffect(() => {
    headerElements.current = slugs.map((slug) => {
      return document.getElementById(slug)!
    })
  }, [slugs])

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

  return (
    <div className="sticky top-20 float-right hidden h-0 w-toc-xl px-8 text-xs lg:block xl:w-toc-4xl">
      <div className="pb-2 text-sm">Table of Contents</div>
      <TocEntryList activeSlug={activeSlug} entries={entries} />
    </div>
  )
}
