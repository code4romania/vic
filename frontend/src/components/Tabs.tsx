import React, { ReactNode, useState } from 'react';
import Select, { SelectItem } from './Select';

interface TabsProps {
  tabs: SelectItem[];
  children: ReactNode;
  defaultTab?: SelectItem;
  onClick: (id: number) => void;
}

const Tabs = ({ children, tabs, onClick, defaultTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<SelectItem>(defaultTab || tabs[0]);

  const onTabClick = (selected: SelectItem): void => {
    setActiveTab(selected);
    onClick(selected.key);
  };

  return (
    <div>
      <nav className="hidden flex-col sm:flex-row lg:flex">
        {tabs.map((tab) => (
          <a
            id={`${tab.value.split(' ').join('-')}__tab`}
            key={tab.key}
            aria-label={tab.value}
            onClick={onTabClick.bind(null, tab)}
            className={`${
              activeTab.key === tab.key ? 'bg-turquoise-200' : 'font-roboto hover:bg-turquoise-200'
            } min-w-fit text-base leading-5 text-cool-gray-800 hover:text-cool-gray-800 px-4 py-2 rounded-md active:bg-turquoise-300`}
          >
            {tab.value}
          </a>
        ))}
      </nav>
      <div className="lg:hidden">
        <Select options={tabs} onChange={onTabClick} defaultValue={activeTab} />
      </div>
      {children}
    </div>
  );
};

export default Tabs;
