import React from 'react';

interface CardHeaderProps {
  children: React.ReactNode;
}

const CardHeader = ({ children }: CardHeaderProps) => (
  <div className="h-[70px] w-full px-8 py-4 flex flex-row items-center justify-between">
    {children}
  </div>
);

export default CardHeader;
