import React, { ReactNode, useEffect, useState } from 'react';
import Select, { SelectItem } from './Select';

interface TabsProps<T> {
  tabs: SelectItem<T>[];
  children: ReactNode;
  defaultTab?: SelectItem<T>;
  onClick: (id: T) => void;
  selectClassName?: string;
}

const Tabs = <T extends React.Key>({
  children,
  tabs,
  onClick,
  defaultTab,
  selectClassName,
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
      <nav className="hidden flex-col sm:flex-row lg:flex gap-2">
        {tabs.map((tab) => (
          <a
            id={`${tab.value.split(' ').join('-')}__tab`}
            key={tab.key}
            aria-label={tab.value}
            onClick={onTabClick.bind(null, tab)}
            className={`${
              activeTab?.key === tab.key
                ? 'bg-yellow-500/[0.5]'
                : 'font-roboto hover:bg-yellow-500/[0.5]'
            } min-w-fit leading-5 text-cool-gray-800 hover:text-cool-gray-800 px-4 py-2 rounded-md active:bg-yellow-500`}
          >
            {tab.value}
          </a>
        ))}
      </nav>
      <div className="lg:hidden">
        <Select
          options={tabs}
          onChange={onTabClick}
          selected={activeTab}
          optionsClassName={selectClassName}
        />
      </div>
      {children}
    </div>
  );
};

export default Tabs;
