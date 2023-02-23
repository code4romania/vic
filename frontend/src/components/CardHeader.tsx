import React from 'react';

interface CardHeaderProps {
  children: React.ReactNode;
}

const CardHeader = ({ children }: CardHeaderProps) => (
  <div className="h-[70px] w-full sm:px-8 px-4 py-4 flex flex-row items-center justify-between gap-1 sm:gap-4">
    {children}
  </div>
);

export default CardHeader;
