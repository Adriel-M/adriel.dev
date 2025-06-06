import { useEffect, useState } from 'react'

import ArrowUp from '@/assets/remix-icons/arrow-up-line.svg?react'
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
      className={`fixed right-8 bottom-8 hidden flex-col gap-3 ${show ? 'md:flex' : 'md:hidden'}`}
    >
      <button
        aria-label="Scroll To Top"
        onClick={handleScrollTop}
        className="rounded-full bg-gray-200 p-2 text-gray-500 transition-all hover:bg-gray-300"
      >
        <ArrowUp className="size-6" />
      </button>
    </div>
  )
}

export default ScrollTop
