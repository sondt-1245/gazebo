import React, { useState, useRef } from 'react'
import { Transition } from '@headlessui/react'
import { useClickAway } from 'react-use'
import cs from 'classnames'

import Icon from 'components/Icon'
import DesktopMenu from './DesktopMenu'
import MobileMenu from './MobileMenu'

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const mobileMenuRef = useRef()
  useClickAway(mobileMenuRef, () => setIsOpen(false))

  return (
    <>
      <header ref={mobileMenuRef} className="fixed top-0 w-full">
        <div
          className={cs(
            'z-50 absolute w-full max-w-7xl mx-auto px-4',
            'bg-gray-900 text-white',
            'sm:px-6 lg:px-8'
          )}
        >
          <nav className="flex items-center justify-between h-16">
            <DesktopMenu />
            <div className="-mr-2 flex md:hidden">
              <button
                tabIndex="0"
                data-testid="toggle-mobile"
                onClick={() => setIsOpen(!isOpen)}
                className={cs(
                  'inline-flex items-center justify-center p-2 h-10 w-10 rounded-md',
                  'bg-gray-800  text-gray-400',
                  'hover:text-white hover:bg-gray-700',
                  'focus:outline-none focus:bg-gray-600'
                )}
              >
                <span className="sr-only">Open main menu</span>
                <Icon
                  name="hamburger"
                  color="text-white"
                  className={cs({ hidden: isOpen })}
                  testId="hamburger-icon"
                />
                <Icon
                  name="times"
                  color="text-white"
                  className={cs({ hidden: !isOpen })}
                  testId="times-icon"
                />
              </button>
            </div>
          </nav>
        </div>
        <Transition
          show={isOpen}
          enter="transform transition-opacity transition-transform duration-300 motion-reduce:transition-none motion-reduce:transform-none"
          enterFrom="opacity-0 -translate-y-full"
          enterTo="opacity-100 translate-y-0"
        >
          <MobileMenu />
        </Transition>
      </header>
    </>
  )
}

export default Header
