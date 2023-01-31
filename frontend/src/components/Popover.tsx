import React, { Fragment } from 'react';
import { Popover as PopoverHeadlessui, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { classNames } from '../common/utils/utils';

interface PopoverItem<T> {
  icon: React.ReactNode;
  label: string;
  onClick: (row: T) => void;
  alert?: boolean;
}

interface PopoverProps<T> {
  row: T;
  items: PopoverItem<T>[];
}

const Popover = <T extends object>({ row, items }: PopoverProps<T>) => {
  return (
    <PopoverHeadlessui className="relative">
      {({ open, close }) => (
        <>
          <PopoverHeadlessui.Button
            className={`${
              open ? 'text-cool-gray-900' : 'text-cool-gray-500'
            }  group bg-white rounded-md inline-flex items-center sm:text-sm lg:text-base text-xs font-medium hover:text-cool-gray-900 focus:outline-none h-full`}
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
            <PopoverHeadlessui.Panel className="absolute right-0 z-10 mt-2 px-0 w-44 sm:w-56 min-w-fit">
              <div className="rounded-lg shadow-section overflow-hidden">
                <div className="bg-white">
                  {items.map(({ icon, label, onClick, alert }) => (
                    <label
                      className={classNames(
                        alert ? 'text-red-700' : 'text-cool-gray-700',
                        `py-2 px-4 flex gap-1 items-center hover:bg-cool-gray-100 transition ease-in-out cursor-pointer`,
                      )}
                      key={label}
                      onClick={() => {
                        onClick(row);
                        close();
                      }}
                    >
                      {icon}
                      <p>{label}</p>
                    </label>
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
