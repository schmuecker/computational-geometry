import clsx from "clsx";
import { Fragment, ReactElement, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";

import { HeroIcon } from "../../types/HeroIcon";

interface Link {
  name: string;
  href: string;
  current: boolean;
  icon: HeroIcon;
}
interface LayoutProps {
  links: Link[];
}

function Layout({ links }: LayoutProps) {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLink = links.find((link) => link.href === pathname);

  return (
    <>
      <div className="flex h-full">
        {/* Narrow sidebar */}
        <div className="hidden w-28 overflow-y-auto bg-blue-700 md:block">
          <div className="flex w-full flex-col items-center py-6">
            <div className="flex flex-shrink-0 items-center">
              <CubeTransparentIcon className="h-8 w-auto text-white" />
            </div>
            <div className="mt-6 w-full flex-1 space-y-1 px-2">
              {links.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    clsx(
                      isActive
                        ? "bg-blue-800 text-white"
                        : "text-blue-100 hover:bg-blue-800 hover:text-white",
                      "group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium"
                    )
                  }
                  aria-current={item.current ? "page" : undefined}
                >
                  <item.icon
                    className={clsx(
                      item.current
                        ? "text-white"
                        : "text-blue-300 group-hover:text-white",
                      "h-6 w-6"
                    )}
                    aria-hidden="true"
                  />
                  <span className="mt-2 text-center font-mono">
                    {item.name}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-20 md:hidden"
            onClose={setMobileMenuOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-blue-700 pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-1 right-0 -mr-14 p-1">
                      <button
                        type="button"
                        className="flex h-12 w-12 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Close sidebar</span>
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <CubeTransparentIcon className="h-8 w-auto text-white" />
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto px-2">
                    <nav className="flex h-full flex-col">
                      <div className="space-y-1">
                        {links.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                              clsx(
                                isActive
                                  ? "bg-blue-800 text-white"
                                  : "text-blue-100 hover:bg-blue-800 hover:text-white",
                                "group py-2 px-3 rounded-md flex items-center text-sm font-medium"
                              )
                            }
                            aria-current={item.current ? "page" : undefined}
                          >
                            <item.icon
                              className={clsx(
                                item.current
                                  ? "text-white"
                                  : "text-blue-300 group-hover:text-white",
                                "mr-3 h-6 w-6"
                              )}
                              aria-hidden="true"
                            />
                            <span className="font-mono">{item.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="w-full">
            <div className="relative z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="flex items-center ml-4 md:ml-8 font-mono">
                {currentLink?.name}
              </div>
            </div>
          </header>

          {/* Main content */}
          <div className="flex flex-1 items-stretch overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              {/* Primary column */}
              <section
                aria-labelledby="primary-heading"
                className="flex h-full min-w-0 flex-1 flex-col lg:order-last"
              >
                <h1 id="primary-heading" className="sr-only">
                  Photos
                </h1>
                {/* Your content */}
                <div className="px-8">
                  <Outlet />
                </div>
              </section>
            </main>

            {/* Secondary column (hidden on smaller screens) */}
            {/* <aside className="hidden w-96 overflow-y-auto border-l border-gray-200 bg-white lg:block">
              Your content 
            </aside> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Layout;
