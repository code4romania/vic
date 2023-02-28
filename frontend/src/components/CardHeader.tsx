import React from 'react';

interface CardHeaderProps {
  children: React.ReactNode;
}

const CardHeader = ({ children }: CardHeaderProps) => (
  <div className="min-h-[70px] w-full sm:px-8 px-4 py-4 flex flex-row items-center justify-between">
    {children}
  </div>
);

export default CardHeader;
