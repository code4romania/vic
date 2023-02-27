import React, { ReactNode, useState } from 'react';
import Select, { SelectItem } from './Select';

interface TabsProps<T> {
  tabs: SelectItem<T>[];
  children: ReactNode;
  defaultTab?: SelectItem<T>;
  onClick: (id: T) => void;
}

const Tabs = <T extends React.Key>({ children, tabs, onClick, defaultTab }: TabsProps<T>) => {
  const [activeTab, setActiveTab] = useState<SelectItem<T>>(defaultTab || tabs[0]);

  const onTabClick = (selected: SelectItem<T>): void => {
    setActiveTab(selected);
    onClick(selected.key);
  };

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
              activeTab.key === tab.key ? 'bg-turquoise-200' : 'font-roboto hover:bg-turquoise-200'
            } min-w-fit leading-5 text-cool-gray-800 hover:text-cool-gray-800 px-4 py-2 rounded-md active:bg-turquoise-300`}
          >
            {tab.value}
          </a>
        ))}
      </nav>
      <div className="lg:hidden">
        <Select options={tabs} onChange={onTabClick} selected={activeTab} />
      </div>
      {children}
    </div>
  );
};

export default Tabs;
