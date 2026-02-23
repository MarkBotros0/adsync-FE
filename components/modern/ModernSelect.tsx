'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { FacebookPage } from '@/lib/types';

interface ModernSelectProps {
  pages: FacebookPage[];
  selectedPage: FacebookPage | null;
  onSelect: (page: FacebookPage) => void;
}

export function ModernSelect({ pages, selectedPage, onSelect }: ModernSelectProps) {
  return (
    <Listbox value={selectedPage || undefined} onChange={onSelect}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer rounded-2xl bg-white/80 backdrop-blur-xl py-3 pl-4 pr-10 text-left border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <span className="block truncate font-medium text-slate-900">
            {selectedPage ? selectedPage.name : 'Select a page'}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white/95 backdrop-blur-xl py-1 shadow-2xl border border-slate-200/60 focus:outline-none">
            {pages.map((page) => (
              <Listbox.Option
                key={page.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                    active ? 'bg-blue-50 text-blue-900' : 'text-slate-900'
                  }`
                }
                value={page}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-medium'}`}>
                      {page.name}
                    </span>
                    {page.category && (
                      <span className="block text-xs text-slate-500 mt-0.5">{page.category}</span>
                    )}
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
