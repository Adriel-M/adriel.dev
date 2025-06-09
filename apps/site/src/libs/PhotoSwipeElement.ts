import type PhotoSwipeLightbox from 'photoswipe/lightbox'

// Generate a new class per customElement name
export const generateClass = () => {
  return class PhotoSwipeElement extends HTMLElement {
    lightbox?: PhotoSwipeLightbox

    async connectedCallback() {
      const { default: PhotoSwipeLightbox } = await import('photoswipe/lightbox')

      this.lightbox = new PhotoSwipeLightbox({
        gallery: this,
        children: 'a',
        showHideAnimationType: 'none',
        zoomAnimationDuration: false,
        pswpModule: () => import('photoswipe'),
        openPromise: () => import('photoswipe/style.css'),
      })
      this.lightbox.init()
    }

    disconnectedCallback() {
      this.lightbox?.destroy()
    }
  }
}
