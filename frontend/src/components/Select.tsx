import React, { Fragment, ReactNode } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { classNames } from '../common/utils/utils';

export interface SelectItem<T> {
  value: string;
  key: T;
}

export interface OptionalSelectItem<T> {
  value?: string;
  key?: T;
}

export interface SelectProps<T> {
  label?: string;
  options: SelectItem<T>[];
  onChange: (item: SelectItem<T> | undefined) => void;
  selected?: SelectItem<T> | OptionalSelectItem<T> | undefined;
  placeholder?: string;
  helper?: ReactNode;
  minWidth?: boolean;
  allowDeselect?: boolean;
  optionsClassName?: string;
}

const Select = <T extends React.Key>({
  label,
  options,
  onChange,
  selected,
  placeholder,
  helper,
  minWidth,
  allowDeselect = false,
  optionsClassName,
}: SelectProps<T>) => {
  const handleChange = (item: SelectItem<T>) => {
    if (allowDeselect && selected && item?.key === selected.key) {
      onChange(undefined);
    } else {
      onChange(item);
    }
  };

  return (
    <Listbox defaultValue={selected} onChange={handleChange}>
      {({ open }) => (
        <div className="flex gap-1 flex-col">
          {label && <Listbox.Label>{label}</Listbox.Label>}
          <div className="relative">
            <Listbox.Button
              className={`h-[42px] ${
                minWidth ? 'min-w-[90px] md:min-w-[100px]' : ''
              } max-w-[37rem] bg-white relative w-full border border-cool-gray-200 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-base text-sm disabled:bg-cool-gray-100`}
            >
              <span className="block truncate lg:text-base text-sm">
                {selected ? (
                  <span className="text-cool-gray-800 font-normal sm:text-sm lg:text-base text-xs">
                    {selected.value}
                  </span>
                ) : (
                  <span className="text-cool-gray-500 font-roboto">{placeholder}</span>
                )}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-cool-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                className={`absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 sm:text-sm lg:text-base text-xs ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none ${optionsClassName}`}
              >
                {(options.length === 0 || !options) && (
                  <Listbox.Option
                    className={
                      'cursor-default select-none text-center relative py-2 pl-3 pr-9 text-cool-gray-500'
                    }
                    value
                    disabled
                  >
                    <span className="block truncate lg:text-base text-sm">No options</span>
                  </Listbox.Option>
                )}
                {options.map((item) => (
                  <Listbox.Option
                    key={item.key}
                    className={({ active }) =>
                      classNames(
                        active ? ' bg-indigo-50' : '',
                        'cursor-default select-none relative py-3 pl-3 pr-9 text-cool-gray-900',
                        selected?.key === item.key ? 'bg-indigo-50' : '',
                      )
                    }
                    value={item}
                  >
                    <span
                      className={classNames(
                        selected?.key === item.key ? 'font-semibold' : 'font-normal',
                        'block truncate lg:text-base text-sm',
                      )}
                    >
                      {item.value}
                    </span>

                    {/* if the item cannot be deselected, display a check icon, otherwise display an x icon to indicate the posibility of deselection */}
                    {selected?.key === item.key && !allowDeselect ? (
                      <span className="text-indigo-500 absolute inset-y-0 right-0 flex items-center pr-2">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : selected?.key === item.key && allowDeselect ? (
                      <span className="text-indigo-500 absolute inset-y-0 right-0 flex items-center pr-2">
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
          {helper}
        </div>
      )}
    </Listbox>
  );
};

export default Select;
