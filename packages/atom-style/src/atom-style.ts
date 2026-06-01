/*!
 * @license MIT
 * Copyright (c) 2024-2026 Andrew Marcuse
 * https://github.com/fileformat/rss.style
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
/* this is a script to make RSS feeds human-readable in browsers.  See https://www.rss.style/ for details. */

const NS = 'http://www.w3.org/1999/xhtml' // Soooooo important!

// The RSS.style logo, inlined as a data URI so the feed page needs no extra
// request for it. Source: https://github.com/fileformat/rss.style
const rssStyleLogo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" height="512" width="512"><rect width="512" height="512" fill="#f80" rx="15%"/><circle cx="145" cy="367" r="35" fill="#fff"/><path fill="none" stroke="#fff" stroke-width="60" d="M109 241c89 0 162 73 162 162M109 127c152 0 276 124 276 276"/></svg>'
  )

// `document.currentScript` is only valid during this script's synchronous
// execution, so read the injected data attributes now, not inside the
// `onreadystatechange` callback below. The feed icon falls back to the inlined
// RSS.style logo when the feed has no `<icon>`/`<logo>` and no override is set.
const fallbackLogoUrl = document.currentScript?.dataset.fallbackLogo ?? rssStyleLogo
const stylesheetUrl = document.currentScript?.dataset.waterCss ?? ''

/** Create an element in the XHTML namespace. */
function el(tag: string): HTMLElement {
  return document.createElementNS(NS, tag) as HTMLElement
}

function safeUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin)
    if (
      parsed.protocol === 'https:' ||
      parsed.protocol === 'http:' ||
      parsed.protocol === 'data:'
    ) {
      return parsed.href
    }
    return ''
  } catch {
    return ''
  }
}

document.onreadystatechange = function () {
  if (document.readyState !== 'complete') {
    return
  }

  const selfLink =
    document.querySelector("[href][rel='self']")?.getAttribute('href') ?? window.location.href
  const title = document.querySelector('feed > title')
  const description = document.querySelector('feed > subtitle')
  const homeLink = document.querySelector("feed > link[rel='alternate']")?.getAttribute('href')
  const iconUrl =
    document.querySelector('feed > icon')?.textContent ||
    document.querySelector('feed > logo')?.textContent ||
    fallbackLogoUrl
  const items = document.querySelectorAll('feed > entry')

  const htmlRoot = el('html')
  const head = el('head')
  const link = el('link')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('href', stylesheetUrl)
  head.appendChild(link)
  const viewport = el('meta')
  viewport.setAttribute('name', 'viewport')
  viewport.setAttribute('content', 'width=device-width, initial-scale=1')
  head.appendChild(viewport)
  htmlRoot.appendChild(head)

  const body = el('body')

  const h1 = el('h1')
  const rssIcon = el('img')
  rssIcon.setAttribute('alt', 'feed icon')
  rssIcon.setAttribute('src', safeUrl(iconUrl))
  rssIcon.setAttribute('style', 'height:1em;vertical-align:middle;padding-right:0.25em;')
  h1.appendChild(rssIcon)
  h1.appendChild(document.createTextNode(title?.textContent ?? ''))
  body.appendChild(h1)

  if (description) {
    const pdesc = el('p')
    pdesc.textContent = description.textContent
    body.appendChild(pdesc)
  }

  const pRss = el('p')
  pRss.appendChild(document.createTextNode('This is the Atom '))
  const rssLink = el('a')
  rssLink.setAttribute('href', 'https://www.rss.style/what-is-a-feed.html')
  rssLink.textContent = 'news feed'
  pRss.appendChild(rssLink)
  pRss.appendChild(document.createTextNode(` for `))
  if (homeLink) {
    const homeLinkEl = el('a')
    homeLinkEl.setAttribute('href', homeLink)
    homeLinkEl.textContent = 'adriel.dev'
    pRss.appendChild(homeLinkEl)
  } else {
    pRss.appendChild(document.createTextNode('adriel.dev'))
  }
  pRss.appendChild(document.createTextNode('.'))
  body.appendChild(pRss)

  const pReader = el('p')
  pReader.appendChild(document.createTextNode('It is meant for '))
  const newsReaderLink = el('a')
  newsReaderLink.setAttribute('href', 'https://www.rss.style/newsreaders.html')
  newsReaderLink.textContent = 'news readers'
  pReader.appendChild(newsReaderLink)
  pReader.appendChild(
    document.createTextNode(', not humans.  Please copy-and-paste the URL into your news reader!')
  )
  body.appendChild(pReader)

  const pCode = el('p')
  const pre = el('pre')
  const code = el('code')
  code.setAttribute('id', 'feedurl')
  code.textContent = selfLink
  pre.appendChild(code)
  pCode.appendChild(pre)

  const button = el('button')
  button.onclick = function () {
    const feedUrlElement = document.getElementById('feedurl')
    if (feedUrlElement) {
      const feedUrl = feedUrlElement.textContent ?? ''
      navigator.clipboard.writeText(feedUrl).then(
        function () {
          button.textContent = 'Copied!'
          window.setTimeout(function () {
            button.textContent = 'Copy to clipboard'
          }, 1000)
        },
        function (err) {
          alert(`Could not copy feed URL: ${err}`)
        }
      )
    }
  }
  button.setAttribute('class', 'clipboard')
  button.setAttribute('data-clipboard-target', '#feedurl')
  button.textContent = 'Copy to clipboard'
  pCode.appendChild(button)
  body.appendChild(pCode)

  for (const item of items) {
    const itemTitle = item.querySelector('title')?.textContent || '(untitled)'
    const itemLink = item.querySelector('link')?.getAttribute('href') ?? ''
    const itemPubDate =
      item.querySelector('published')?.textContent ||
      item.querySelector('updated')?.textContent ||
      '(undated)'
    const itemDesc =
      item.querySelector('content')?.textContent || item.querySelector('summary')?.textContent

    const details = el('details')
    const summary = el('summary')
    const titleLink = el('a')
    titleLink.setAttribute('href', safeUrl(itemLink))
    titleLink.textContent = itemTitle
    summary.appendChild(titleLink)
    summary.style.width = '100%'
    summary.appendChild(document.createTextNode(` - ${itemPubDate}`))
    details.appendChild(summary)
    if (itemDesc) {
      const descContainer = el('div')
      descContainer.textContent = itemDesc
      details.appendChild(descContainer)
    }

    body.appendChild(details)
  }

  const pCount = el('p')
  pCount.textContent = `${items.length} news items.`
  body.appendChild(pCount)

  const smallPoweredBy = el('small')
  smallPoweredBy.appendChild(document.createTextNode('Powered by '))

  const rssStyleLink = el('a')
  rssStyleLink.setAttribute('href', 'https://www.rss.style/')
  const rssStyleIcon = el('img')
  rssStyleIcon.setAttribute('alt', 'RSS.style logo')
  rssStyleIcon.setAttribute('src', safeUrl(rssStyleLogo))
  rssStyleIcon.setAttribute('style', 'height:1em;vertical-align:middle;padding-right:0.25em;')
  rssStyleLink.appendChild(rssStyleIcon)
  rssStyleLink.appendChild(document.createTextNode('RSS.style'))
  smallPoweredBy.appendChild(rssStyleLink)
  smallPoweredBy.appendChild(document.createTextNode('.'))

  const pPoweredBy = el('p')
  pPoweredBy.appendChild(smallPoweredBy)

  body.appendChild(pPoweredBy)

  htmlRoot.appendChild(body)

  document.documentElement.replaceWith(htmlRoot)
}
