type ThrottledFn = () => void

export function throttle(callback: () => void): ThrottledFn {
  let ticking = false

  return function throttled() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      callback()
      ticking = false
    })
  }
}
