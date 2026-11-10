import React from 'react';

interface CardHeaderProps {
  children: React.ReactNode;
}

const CardHeader = ({ children }: CardHeaderProps) => (
  <div className="min-h-[64px] w-full sm:px-6 px-4 py-4 gap-x-4 gap-y-2 flex flex-row flex-wrap items-center justify-between">
    {children}
  </div>
);

export default CardHeader;
