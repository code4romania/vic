import React from 'react';

interface FilterProps {
  children: React.ReactNode;
}

const Filter = ({ children }: FilterProps) => {
  return <div className="min-[500px]:basis-2/5 md:basis-1/3 lg:basis-1/4 w-full">{children}</div>;
};

export default Filter;
