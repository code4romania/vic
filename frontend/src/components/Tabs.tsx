import React, { ReactNode, useEffect, useState } from 'react';
import { SelectItem } from './Select';
import { classNames } from '../common/utils/utils';

export interface TabItem<T> extends SelectItem<T> {
  // shown as a badge next to the label, e.g. pending requests
  count?: number;
}

// segmented: the page's main tabs (gray track, white selected tab). pills: statuses inside a
// section (navy selected, white with a border otherwise). The only two tab styles of the app.
export type TabsVariant = 'segmented' | 'pills';

interface TabListProps<T> {
  tabs: TabItem<T>[];
  active?: T;
  onSelect: (tab: TabItem<T>) => void;
  variant?: TabsVariant;
  // alert: a red badge when something waits (requests); neutral: a plain count (announcements)
  countTone?: 'alert' | 'neutral';
  // the track as wide as its tabs, instead of the full width
  fit?: boolean;
  ariaLabel?: string;
}

const badgeClass = (count: number, active: boolean, pills: boolean, tone: 'alert' | 'neutral') => {
  if (tone === 'neutral' || count === 0) {
    if (active) return 'bg-navy text-white';
    // an inactive segmented tab sits on the gray track: a white badge stays visible there
    return pills ? 'bg-cool-gray-200 text-cool-gray-700' : 'bg-white text-cool-gray-700';
  }
  return active && pills ? 'bg-white text-navy' : 'bg-figure-red text-white';
};

// Real tab buttons: Tab reaches them, Enter/Space selects, screen readers hear the state. On
// narrow screens the row scrolls sideways instead of turning into a select.
export const TabList = <T extends React.Key>({
  tabs,
  active,
  onSelect,
  variant = 'segmented',
  countTone = 'alert',
  fit,
  ariaLabel,
}: TabListProps<T>) => {
  const segmented = variant === 'segmented';
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={classNames(
        segmented ? 'p-1 rounded-xl bg-cool-gray-200/70' : '',
        fit ? 'self-start max-w-full' : 'w-full',
        'flex gap-1 overflow-x-auto no-scrollbar',
      )}
    >
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <button
            type="button"
            role="tab"
            id={`${tab.value.split(' ').join('-')}__tab`}
            key={tab.key}
            aria-label={tab.count === undefined ? tab.value : `${tab.value} (${tab.count})`}
            aria-selected={selected}
            onClick={() => onSelect(tab)}
            className={classNames(
              segmented
                ? selected
                  ? 'bg-white text-cool-gray-900 shadow-card'
                  : 'text-cool-gray-700 hover:text-cool-gray-900'
                : selected
                  ? 'bg-navy text-white hover:text-white'
                  : 'bg-white text-cool-gray-700 ring-1 ring-inset ring-cool-gray-300 hover:bg-cool-gray-50 hover:text-cool-gray-900',
              segmented && !fit ? 'flex-1' : '',
              'shrink-0 min-h-[40px] whitespace-nowrap flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-robotoMedium cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-navy',
            )}
          >
            {tab.value}
            {tab.count !== undefined && (
              <span
                className={classNames(
                  badgeClass(tab.count, selected, !segmented, countTone),
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
  );
};

interface TabsProps<T> {
  tabs: TabItem<T>[];
  children: ReactNode;
  defaultTab?: SelectItem<T>;
  onClick: (id: T) => void;
  variant?: TabsVariant;
  countTone?: 'alert' | 'neutral';
}

const Tabs = <T extends React.Key>({
  children,
  tabs,
  onClick,
  defaultTab,
  variant = 'segmented',
  countTone,
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

  return (
    <div className="flex flex-col gap-5">
      <TabList<T>
        tabs={tabs}
        active={activeTab?.key}
        onSelect={onTabClick}
        variant={variant}
        countTone={countTone}
        fit={variant === 'pills'}
      />
      {children}
    </div>
  );
};

export default Tabs;
