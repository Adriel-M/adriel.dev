/*
 * MIT License
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
const fallbackLogoUrl = document.currentScript?.dataset.fallbackLogo ?? ''

document.onreadystatechange = async function () {
  if (document.readyState === 'complete') {
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

    const NS = 'http://www.w3.org/1999/xhtml' // Soooooo important!

    const htmlRoot = document.createElementNS(NS, 'html')
    const head = document.createElementNS(NS, 'head')
    const link = document.createElementNS(NS, 'link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('href', '/static/feed/water.light.css')
    head.appendChild(link)
    const viewport = document.createElementNS(NS, 'meta')
    viewport.setAttribute('name', 'viewport')
    viewport.setAttribute('content', 'width=device-width, initial-scale=1')
    head.appendChild(viewport)
    htmlRoot.appendChild(head)

    const body = document.createElementNS(NS, 'body')

    const h1 = document.createElementNS(NS, 'h1')
    const rssIcon = document.createElementNS(NS, 'img')
    rssIcon.setAttribute('alt', 'feed icon')
    rssIcon.setAttribute('src', iconUrl)
    rssIcon.setAttribute('style', 'height:1em;vertical-align:middle;padding-right:0.25em;')
    h1.appendChild(rssIcon)
    h1.appendChild(document.createTextNode(title.textContent))
    body.appendChild(h1)

    if (description) {
      const pdesc = document.createElementNS(NS, 'p')
      pdesc.textContent = description.textContent
      body.appendChild(pdesc)
    }

    const pRss = document.createElementNS(NS, 'p')
    pRss.appendChild(document.createTextNode('This is the Atom '))
    const rssLink = document.createElementNS(NS, 'a')
    rssLink.setAttribute('href', 'https://www.rss.style/what-is-a-feed.html')
    rssLink.textContent = 'news feed'
    pRss.appendChild(rssLink)
    pRss.appendChild(document.createTextNode(` for `))
    if (homeLink) {
      const homeLinkEl = document.createElementNS(NS, 'a')
      homeLinkEl.setAttribute('href', homeLink)
      homeLinkEl.textContent = 'adriel.dev'
      pRss.appendChild(homeLinkEl)
    } else {
      pRss.appendChild(document.createTextNode('adriel.dev'))
    }
    pRss.appendChild(document.createTextNode('.'))
    body.appendChild(pRss)

    const pReader = document.createElementNS(NS, 'p')
    pReader.appendChild(document.createTextNode('It is meant for '))
    const newsReaderLink = document.createElementNS(NS, 'a')
    newsReaderLink.setAttribute('href', 'https://www.rss.style/newsreaders.html')
    newsReaderLink.textContent = 'news readers'
    pReader.appendChild(newsReaderLink)
    pReader.appendChild(
      document.createTextNode(', not humans.  Please copy-and-paste the URL into your news reader!')
    )
    body.appendChild(pReader)

    const pCode = document.createElementNS(NS, 'p')
    const pre = document.createElementNS(NS, 'pre')
    const code = document.createElementNS(NS, 'code')
    code.setAttribute('id', 'feedurl')
    code.textContent = selfLink
    pre.appendChild(code)
    pCode.appendChild(pre)

    const button = document.createElementNS(NS, 'button')
    button.onclick = function () {
      const feedUrlElement = document.getElementById('feedurl')
      if (feedUrlElement) {
        const feedUrl = feedUrlElement.textContent
        navigator.clipboard.writeText(feedUrl).then(
          function () {
            button.textContent = 'Copied!'
            window.setTimeout(function () {
              button.textContent = 'Copy to clipboard'
            }, 1000)
          },
          function (err) {
            alert('Could not copy feed URL: ', err)
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
      const itemLink = item.querySelector('link').textContent
      const itemPubDate =
        item.querySelector('published')?.textContent ||
        item.querySelector('updated')?.textContent ||
        '(undated)'
      const itemDesc =
        item.querySelector('content')?.textContent || item.querySelector('summary')?.textContent

      const details = document.createElementNS(NS, 'details')
      const summary = document.createElementNS(NS, 'summary')
      const titleLink = document.createElementNS(NS, 'a')
      titleLink.setAttribute('href', itemLink)
      titleLink.textContent = itemTitle
      summary.appendChild(titleLink)
      summary.style.width = '100%'
      summary.appendChild(document.createTextNode(` - ${itemPubDate}`))
      details.appendChild(summary)
      if (itemDesc) {
        try {
          if (itemDesc.indexOf('<') !== -1 && itemDesc.indexOf('>') !== -1) {
            // Contains unescaped HTML, so slam it in there
            const descContainer = document.createElementNS(NS, 'div')
            descContainer.innerHTML = itemDesc
            details.appendChild(descContainer)
          } else if (itemDesc.indexOf('&lt;') !== -1 && itemDesc.indexOf('&gt;') !== -1) {
            // Contains escaped HTML, so unescape first, then slam it in there
            const decodeArea = document.createElementNS(NS, 'textarea')
            decodeArea.innerHTML = itemDesc
            const descContainer = document.createElementNS(NS, 'div')
            descContainer.innerHTML = decodeArea.value
            details.appendChild(descContainer)
          } else {
            // Plain text???
            details.appendChild(document.createTextNode(itemDesc))
          }
        } catch (e) {
          // unfortunately, the content needs to be XHTML, so this gets triggered a lot
          console.log('ERROR: Could not parse item description HTML: ', e)
          details.appendChild(document.createTextNode(itemDesc))
        }
      }

      body.appendChild(details)
    }

    const pCount = document.createElementNS(NS, 'p')
    pCount.textContent = `${items.length} news items.`
    body.appendChild(pCount)

    const smallPoweredBy = document.createElementNS(NS, 'small')
    smallPoweredBy.appendChild(document.createTextNode('Powered by '))

    const rssStyleLink = document.createElementNS(NS, 'a')
    rssStyleLink.setAttribute('href', 'https://www.rss.style/')
    const rssStyleIcon = document.createElementNS(NS, 'img')
    rssStyleIcon.setAttribute('alt', 'RSS.style logo')
    rssStyleIcon.setAttribute('src', '/static/feed/RssStyleFavicon.svg')
    rssStyleIcon.setAttribute('style', 'height:1em;vertical-align:middle;padding-right:0.25em;')
    rssStyleLink.appendChild(rssStyleIcon)
    rssStyleLink.appendChild(document.createTextNode('RSS.style'))
    smallPoweredBy.appendChild(rssStyleLink)
    smallPoweredBy.appendChild(document.createTextNode('.'))

    const pPoweredBy = document.createElementNS(NS, 'p')
    pPoweredBy.appendChild(smallPoweredBy)

    body.appendChild(pPoweredBy)

    htmlRoot.appendChild(body)

    document.documentElement.replaceWith(htmlRoot)
    return
  }
}
