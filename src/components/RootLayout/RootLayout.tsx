import clsx from "clsx";
import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";

import { Link as LinkType } from "../../types/Link";
import A from "./A/A";

interface LayoutProps {
  links: LinkType[];
}

function RootLayout({ links }: LayoutProps) {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLink = links.find((link) => link.href === pathname);

  const close = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex h-full">
        {/* Narrow sidebar */}
        <div className="hidden w-28 overflow-y-auto bg-ebony-900 md:block">
          <div className="flex w-full flex-col items-center py-6">
            <div className="flex flex-shrink-0 items-center">
              <CubeTransparentIcon className="h-8 w-auto text-ebony-100" />
            </div>
            <div className="mt-6 w-full flex-1 space-y-1 px-2">
              {links.map((item) => {
                const LinkComponent = item.hardRefresh ? A : Link;
                return (
                  <LinkComponent
                    key={item.name}
                    to={item.href}
                    href={item.href}
                    className={clsx(
                      item.current
                        ? "bg-portage-400/50 text-white"
                        : "text-blue-100 hover:bg-white/5 hover:text-white",
                      "group flex w-full flex-col items-center rounded-md p-3 text-xs font-medium"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    <item.icon
                      className={clsx(
                        item.current
                          ? "text-white"
                          : "text-ebony-300 group-hover:text-ebony-100 ",
                        "h-6 w-6 transition"
                      )}
                      aria-hidden="true"
                    />
                    <span className="mt-2 text-center font-mono">
                      {item.name}
                    </span>
                  </LinkComponent>
                );
              })}
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <Transition.Root show={isOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-20 md:hidden"
            onClose={setIsOpen}
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
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-ebony-900 pt-5 pb-4">
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
                        onClick={close}
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
                          <Link
                            onClick={close}
                            key={item.name}
                            to={item.href}
                            className={clsx(
                              item.current
                                ? "bg-portage-400/50 text-white"
                                : "text-blue-100 hover:bg-white/5 hover:text-white",
                              "group flex items-center rounded-md py-2 px-3 text-sm font-medium transition"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            <item.icon
                              className={clsx(
                                item.current
                                  ? "text-white"
                                  : "text-ebony-300 group-hover:text-ebony-100 ",
                                "mr-3 h-6 w-6 transition"
                              )}
                              aria-hidden="true"
                            />
                            <span className="font-mono">{item.name}</span>
                          </Link>
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
                onClick={() => setIsOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="ml-4 flex items-center font-mono md:ml-8">
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
                <div className="p-8">
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

export default RootLayout;
