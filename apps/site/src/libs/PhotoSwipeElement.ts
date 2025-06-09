import type PhotoSwipeLightbox from 'photoswipe/lightbox'
import photoSwipeCssUrl from 'photoswipe/style.css?url'

let pswpStylePromise: Promise<void> | null = null

// Load stylesheet by injecting a link. This css is shared between multiple PhotoSwipeElement
// so try to load it at most once
const loadPswpStylesheet = () => {
  if (!pswpStylePromise) {
    pswpStylePromise = new Promise((resolve, reject) => {
      // extra guard
      if (document.querySelector('link[data-pswp-style]')) {
        resolve()
        return
      }

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = photoSwipeCssUrl
      link.setAttribute('data-pswp-style', '')

      link.onload = () => resolve()
      link.onerror = () => reject(new Error('Failed to load PhotoSwipe CSS'))

      document.head.appendChild(link)
    })
  }

  return pswpStylePromise
}

const rootMargin = 400

// Generate a new class per customElement name
export const generateClass = () => {
  return class PhotoSwipeElement extends HTMLElement {
    lightbox?: PhotoSwipeLightbox
    observer?: IntersectionObserver
    initialized = false

    async connectedCallback() {
      const tryInit = () => {
        if (this.initialized) return

        this.initialized = true
        this.init()
      }

      this.observer = new IntersectionObserver(
        (entries, observer) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              tryInit()
              observer.disconnect()
            }
          }
        },
        {
          rootMargin: `${rootMargin}px`,
        }
      )

      this.observer.observe(this)

      // Check if this element is within rootMargin px of the viewport on page load
      const rect = this.getBoundingClientRect()

      const rootTop = -rootMargin
      const rootBottom = window.innerHeight + rootMargin

      const alreadyIntersecting = rect.bottom > rootTop && rect.top < rootBottom

      if (alreadyIntersecting) {
        tryInit()
        this.observer.disconnect()
      }
    }

    async init() {
      const { default: PhotoSwipeLightbox } = await import('photoswipe/lightbox')
      // start loading the css before the gallery image is clicked
      loadPswpStylesheet()

      this.lightbox = new PhotoSwipeLightbox({
        gallery: this,
        children: 'a',
        showHideAnimationType: 'none',
        zoomAnimationDuration: false,
        pswpModule: () => import('photoswipe'),
        openPromise: () => loadPswpStylesheet(),
      })
      this.lightbox.init()
    }

    disconnectedCallback() {
      this.lightbox?.destroy()
      this.observer?.disconnect()
    }
  }
}
