type ThrottledFn = () => void

export function throttle(callback: () => void): ThrottledFn {
  let ticking = false

  return function throttled() {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(() => {
        callback()
        ticking = false
      })
    }
  }
}
