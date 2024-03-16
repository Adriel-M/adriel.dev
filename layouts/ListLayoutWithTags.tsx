/* eslint-disable jsx-a11y/anchor-is-valid */
'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'
import { compareTagsByCountThenAlpha } from '@/core/utils'

export interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutWithTagsProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

const getBasePath = (pathname: string): string => {
  const paths: string[] = []
  const split = pathname.split('/')

  for (const path of split) {
    if (path === 'page') break

    if (path) {
      paths.push(path)
    }
  }

  return paths.join('/')
}

const getCurrentTag = (pathname: string): string => {
  const split = pathname.split('/')

  // actual tag appears right after the tags path
  const tagIndex = split.indexOf('tags') + 1

  return split[tagIndex]
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = getBasePath(pathname)
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pb-8 pt-6 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            className="hover:text-primary-500"
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
            scroll={false}
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link
            className="hover:text-primary-500"
            href={`/${basePath}/page/${currentPage + 1}`}
            rel="next"
            scroll={false}
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}

const LINK_CURRENT_PAGE = 'text-primary-500 hover:text-primary-600'
const LINK_NOT_CURRENT_PAGE = 'text-gray-700 hover:text-primary-500'

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutWithTagsProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort(compareTagsByCountThenAlpha(tagCounts))
  const currentTag = getCurrentTag(pathname)

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  const allPostCss = pathname.startsWith('/posts') ? LINK_CURRENT_PAGE : LINK_NOT_CURRENT_PAGE

  return (
    <>
      <div>
        <div className="pb-6 pt-6">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
        </div>
        <div className="flex sm:space-x-24">
          <div className="shadow-md/70/40 hidden h-full max-h-screen min-w-[280px] max-w-[280px] flex-wrap overflow-auto rounded bg-gray-50 pt-5 sm:flex">
            <div className="px-6 py-4">
              <Link href={`/posts`} className={`${allPostCss} font-bold uppercase`}>
                All Posts
              </Link>
              <ul>
                {sortedTags.map((t) => {
                  const tagCss = currentTag === slug(t) ? LINK_CURRENT_PAGE : LINK_NOT_CURRENT_PAGE
                  return (
                    <li key={t} className="my-3">
                      <Link
                        href={`/tags/${slug(t)}`}
                        className={`${tagCss} px-3 py-2 text-sm font-medium uppercase`}
                        aria-label={`View posts tagged ${t}`}
                      >
                        {`${t} (${tagCounts[t]})`}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
          <div>
            <ul>
              {displayPosts.map((post) => {
                const { path, date, title, summary, tags } = post
                return (
                  <li key={path} className="py-5">
                    <article className="flex flex-col space-y-2 xl:space-y-0">
                      <dl>
                        <dt className="sr-only">Published on</dt>
                        <dd className="text-base font-medium leading-6 text-gray-500">
                          <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                        </dd>
                      </dl>
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link
                              href={`/${path}`}
                              className="text-gray-900 hover:text-primary-500"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags?.sort()?.map((tag) => <Tag key={tag} text={tag} />)}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500">{summary}</div>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
