import { Blog } from 'contentlayer/generated'
import { formatDate } from 'pliny/utils/formatDate'

import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'

interface Props {
  posts: Blog[]
}

export default function Home({ posts }: Props) {
  return (
    <>
      <div className="divide-y divide-gray-200">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Latest
          </h1>
          <p className="text-lg leading-7 text-gray-500">{siteMetadata.description}</p>
        </div>
        <ul className="divide-y divide-gray-200">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, siteMetadata.postsInFrontPageCount).map((post) => {
            const { slug, date, title, summary, tags, path } = post
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500">
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
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
                            {tags.sort().map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500">{summary}</div>
                      </div>
                      <div className="text-base font-medium leading-6">
                        <Link
                          href={`/${path}`}
                          className="hover:text-primary-500"
                          aria-label={`Read more: "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > siteMetadata.postsInFrontPageCount && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link href="/posts" className="hover:text-primary-500" aria-label="All posts">
            All Posts &rarr;
          </Link>
        </div>
      )}
    </>
  )
}
