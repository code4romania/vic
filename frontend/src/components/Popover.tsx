import React from 'react';
import { Popover as PopoverHeadlessui, PopoverButton, PopoverPanel } from '@headlessui/react';
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

// The "⋮" menu on table rows: a named 40×40 button, and real buttons inside so every action works
// from the keyboard and is announced by screen readers. The panel is anchored to the button in a
// portal, so the table needs no empty space under its last row and is never cut by the card.
const Popover = <T extends object>({ row, items, label }: PopoverProps<T>) => {
  return (
    <PopoverHeadlessui className="relative">
      {({ open, close }) => (
        <>
          <PopoverButton
            aria-label={label ?? i18n.t('general:actions')}
            title={label ?? i18n.t('general:actions')}
            className={classNames(
              open ? 'bg-cool-gray-100 text-cool-gray-900' : 'text-cool-gray-600',
              'w-10 h-10 shrink-0 rounded-lg inline-flex items-center justify-center hover:bg-cool-gray-100 hover:text-cool-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy',
            )}
          >
            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
          </PopoverButton>
          {/* focus moves into the panel when it opens, and back to "⋮" when it closes */}
          <PopoverPanel
            focus
            anchor={{ to: 'bottom end', gap: 4, padding: 8 }}
            transition
            className="z-30 w-56 min-w-fit rounded-lg bg-white py-1 shadow-menu ring-1 ring-cool-gray-200 transition duration-150 ease-out data-[closed]:opacity-0 data-[closed]:translate-y-1"
          >
            <div className="flex flex-col">
              {items.map(({ icon, label, onClick, alert, primary, disabled, title }) => (
                <button
                  type="button"
                  className={classNames(
                    alert ? 'text-red-700' : primary ? 'text-figure-green' : 'text-cool-gray-800',
                    disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-cool-gray-100 cursor-pointer',
                    'w-full min-h-[40px] text-left py-2 px-4 flex gap-2 items-center transition ease-in-out focus:outline-none focus-visible:bg-cool-gray-100',
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
          </PopoverPanel>
        </>
      )}
    </PopoverHeadlessui>
  );
};

export default Popover;
