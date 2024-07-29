import React, { ComponentPropsWithoutRef } from 'react';

interface CardProps extends ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

const Card = ({ children, className }: CardProps) => (
  <div
    className={`overflow-visible bg-white rounded-lg flex flex-col divide-y divide-cool-gray-200 gap-0 shadow-section grow ${className}`}
  >
    {children}
  </div>
);

export default Card;
