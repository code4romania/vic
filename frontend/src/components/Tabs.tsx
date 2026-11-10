import React, { ReactNode, useEffect, useState } from 'react';
import Select, { SelectItem } from './Select';
import { classNames } from '../common/utils/utils';

export interface TabItem<T> extends SelectItem<T> {
  // shown as a badge next to the label, e.g. pending requests
  count?: number;
}

interface TabsProps<T> {
  tabs: TabItem<T>[];
  children: ReactNode;
  defaultTab?: SelectItem<T>;
  onClick: (id: T) => void;
  // segmented: the page's main tabs, full width. pills: statuses inside a section.
  variant?: 'segmented' | 'pills';
}

const labelOf = <T,>(tab: TabItem<T>) =>
  tab.count === undefined ? tab.value : `${tab.value} (${tab.count})`;

const Tabs = <T extends React.Key>({
  children,
  tabs,
  onClick,
  defaultTab,
  variant = 'segmented',
}: TabsProps<T>) => {
  const [activeTab, setActiveTab] = useState<SelectItem<T>>(defaultTab || tabs[0]);

  const onTabClick = (selected: SelectItem<T> | undefined): void => {
    if (selected) {
      setActiveTab(selected);
      onClick(selected?.key);
    }
  };

  useEffect(() => {
    if (defaultTab && defaultTab?.key !== activeTab?.key) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const segmented = variant === 'segmented';

  return (
    <div className="flex flex-col gap-5">
      {/* real tab buttons: Tab reaches them, Enter/Space selects, screen readers hear the state */}
      <div
        role="tablist"
        className={classNames(
          segmented ? 'p-1 rounded-xl bg-cool-gray-200/70' : 'flex-wrap',
          'hidden lg:flex gap-1',
        )}
      >
        {tabs.map((tab) => {
          const active = activeTab?.key === tab.key;
          return (
            <button
              type="button"
              role="tab"
              id={`${tab.value.split(' ').join('-')}__tab`}
              key={tab.key}
              aria-label={labelOf(tab)}
              aria-selected={active}
              onClick={onTabClick.bind(null, tab)}
              className={classNames(
                segmented
                  ? active
                    ? 'flex-1 bg-white text-cool-gray-900 shadow-card'
                    : 'flex-1 text-cool-gray-600 hover:text-cool-gray-900'
                  : active
                    ? 'bg-navy text-white hover:text-white'
                    : 'bg-white text-cool-gray-700 ring-1 ring-inset ring-cool-gray-300 hover:bg-cool-gray-50 hover:text-cool-gray-900',
                'min-w-fit flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-robotoMedium cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-navy',
              )}
            >
              {tab.value}
              {tab.count !== undefined && (
                <span
                  className={classNames(
                    tab.count > 0
                      ? active && !segmented
                        ? 'bg-white text-navy'
                        : 'bg-figure-red text-white'
                      : 'bg-cool-gray-200 text-cool-gray-600',
                    'min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-robotoBold flex items-center justify-center',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="lg:hidden">
        <Select
          options={tabs.map((tab) => ({ key: tab.key, value: labelOf(tab) }))}
          onChange={onTabClick}
          selected={
            activeTab && {
              key: activeTab.key,
              value: labelOf(tabs.find((tab) => tab.key === activeTab.key) ?? activeTab),
            }
          }
        />
      </div>
      {children}
    </div>
  );
};

export default Tabs;
