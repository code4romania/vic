import React, { Fragment } from 'react';
import { Popover as PopoverHeadlessui, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import i18n from '../common/config/i18n';
import { classNames } from '../common/utils/utils';

interface PopoverItem<T> {
  icon: React.ReactNode;
  label: string;
  onClick: (row: T) => void;
  alert?: boolean;
  primary?: boolean;
  // e.g. an action that needs a validated organization; title says why
  disabled?: boolean;
  title?: string;
}

interface PopoverProps<T> {
  row: T;
  items: PopoverItem<T>[];
  // The accessible name of the "⋮" button; defaults to "Acțiuni"
  label?: string;
}

// The "⋮" menu on table rows: a named button, and real buttons inside so every action works from
// the keyboard and is announced by screen readers.
const Popover = <T extends object>({ row, items, label }: PopoverProps<T>) => {
  return (
    <PopoverHeadlessui className="relative">
      {({ open, close }) => (
        <>
          <PopoverHeadlessui.Button
            aria-label={label ?? i18n.t('general:actions')}
            title={label ?? i18n.t('general:actions')}
            className={`${
              open ? 'text-cool-gray-900' : 'text-cool-gray-500'
            }  group bg-white rounded-md inline-flex items-center sm:text-sm lg:text-base text-xs font-medium hover:text-cool-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy h-full`}
          >
            <EllipsisVerticalIcon
              className={`${
                open ? 'text-cool-gray-600' : 'text-cool-gray-400'
              } h-5 w-5 group-hover:text-cool-gray-500`}
              aria-hidden="true"
            />
          </PopoverHeadlessui.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            {/* focus moves into the panel when it opens, and back to "⋮" when it closes */}
            <PopoverHeadlessui.Panel
              focus
              className="absolute right-0 z-10 mt-2 px-0 w-44 sm:w-56 min-w-fit"
            >
              <div className="rounded-lg shadow-section overflow-hidden">
                <div className="bg-white flex flex-col">
                  {items.map(({ icon, label, onClick, alert, primary, disabled, title }) => (
                    <button
                      type="button"
                      className={classNames(
                        alert ? 'text-red-700' : primary ? 'text-green-500' : 'text-cool-gray-700',
                        disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-cool-gray-100 cursor-pointer',
                        `w-full text-left py-2 px-4 flex gap-1 items-center transition ease-in-out focus:outline-none focus-visible:bg-cool-gray-100`,
                      )}
                      key={label}
                      disabled={disabled}
                      title={title}
                      onClick={() => {
                        onClick(row);
                        close();
                      }}
                    >
                      <span aria-hidden="true">{icon}</span>
                      <small>{label}</small>
                    </button>
                  ))}
                </div>
              </div>
            </PopoverHeadlessui.Panel>
          </Transition>
        </>
      )}
    </PopoverHeadlessui>
  );
};

export default Popover;
