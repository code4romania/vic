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
  // names the field when it has no visible label (filters)
  ariaLabel?: string;
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
  ariaLabel,
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
              aria-label={ariaLabel}
              className={`h-[42px] ${
                minWidth ? 'min-w-[90px] md:min-w-[100px]' : ''
              } max-w-[37rem] bg-white relative w-full border border-cool-gray-300 rounded-lg pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-navy focus:border-navy disabled:bg-cool-gray-100`}
            >
              {/* 16px on phones (no zoom on focus in iOS), 14px from sm, like every other field */}
              <span className="block truncate text-base sm:text-sm">
                {selected ? (
                  <span className="text-cool-gray-900 font-normal text-base sm:text-sm">
                    {selected.value}
                  </span>
                ) : (
                  <span className="text-cool-gray-500 font-roboto text-base sm:text-sm">
                    {placeholder}
                  </span>
                )}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-cool-gray-500" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base sm:text-sm shadow-menu ring-1 ring-cool-gray-200 overflow-auto focus:outline-none">
                {(options.length === 0 || !options) && (
                  <Listbox.Option
                    className={
                      'cursor-default select-none text-center relative py-2 pl-3 pr-9 text-cool-gray-500'
                    }
                    value
                    disabled
                  >
                    <span className="block truncate text-base sm:text-sm">–</span>
                  </Listbox.Option>
                )}
                {options.map((item) => (
                  <Listbox.Option
                    key={item.key}
                    className={({ active }) =>
                      classNames(
                        active || selected?.key === item.key ? 'bg-navy-50' : '',
                        'cursor-default select-none relative py-2.5 pl-3 pr-9 text-cool-gray-900',
                      )
                    }
                    value={item}
                  >
                    <span
                      className={classNames(
                        selected?.key === item.key ? 'font-semibold' : 'font-normal',
                        'block truncate text-base sm:text-sm',
                      )}
                    >
                      {item.value}
                    </span>

                    {/* if the item cannot be deselected, display a check icon, otherwise display an x icon to indicate the posibility of deselection */}
                    {selected?.key === item.key && !allowDeselect ? (
                      <span className="text-navy absolute inset-y-0 right-0 flex items-center pr-2">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : selected?.key === item.key && allowDeselect ? (
                      <span className="text-navy absolute inset-y-0 right-0 flex items-center pr-2">
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
