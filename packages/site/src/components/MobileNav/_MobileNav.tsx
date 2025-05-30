import { useState } from 'react'

import { sectionContainerClasses } from '@/libs/consts.ts'
import headerNavLinks from '@/libs/headerNavLinks'

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false)

  const onToggleNav = () => {
    setNavShow((status) => {
      document.body.style.overflow = status ? 'auto' : 'hidden'
      return !status
    })
  }

  return (
    <>
      <button aria-label="Toggle Menu" onClick={onToggleNav} className="px-0.5 sm:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-8 text-gray-900"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={`fixed left-0 top-0 z-10 size-full bg-white duration-300 ease-in-out ${
          navShow ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <section className={sectionContainerClasses}>
          <div className="flex justify-end">
            <button className="mr-2 mt-16 size-8" aria-label="Toggle Menu" onClick={onToggleNav}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="text-gray-900"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <nav className="fixed mt-8 h-full">
            {headerNavLinks.map((link) => (
              <div key={link.title} className="px-6 py-4">
                <a
                  href={link.href}
                  className="text-2xl font-bold tracking-widest"
                  onClick={onToggleNav}
                >
                  {link.title}
                </a>
              </div>
            ))}
          </nav>
        </section>
      </div>
    </>
  )
}

export default MobileNav
