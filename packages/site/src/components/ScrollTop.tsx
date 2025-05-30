import { useEffect, useState } from 'react'

import { throttle } from '@/libs/FunctionUtils.ts'

const ScrollTop = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (window.scrollY > 50) setShow(true)

    const handleScroll = () => {
      if (window.scrollY > 50) setShow(true)
      else setShow(false)
    }

    const throttleHandleScroll = throttle(handleScroll)

    window.addEventListener('scroll', throttleHandleScroll)
    return () => window.removeEventListener('scroll', throttleHandleScroll)
  }, [])

  const handleScrollTop = () => {
    window.scrollTo({ top: 0 })
  }

  return (
    <div
      className={`fixed bottom-8 right-8 hidden flex-col gap-3 ${show ? 'md:flex' : 'md:hidden'}`}
    >
      <button
        aria-label="Scroll To Top"
        onClick={handleScrollTop}
        className="rounded-full bg-gray-200 p-2 text-gray-500 transition-all hover:bg-gray-300"
      >
        <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}

export default ScrollTop
