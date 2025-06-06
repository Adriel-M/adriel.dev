import { useState } from 'react'

import Close from '@/assets/remix-icons/close-large-line.svg?react'
import Menu from '@/assets/remix-icons/menu-line.svg?react'
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
        <Menu className="size-6" />
      </button>
      <div
        className={`fixed top-0 left-0 z-10 size-full bg-white duration-300 ease-in-out ${
          navShow ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <section className={sectionContainerClasses}>
          <div className="flex justify-end">
            <button className="mt-16 -mr-1 size-8" aria-label="Toggle Menu" onClick={onToggleNav}>
              <Close className="size-6" />
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
