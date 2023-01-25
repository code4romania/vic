import React from 'react';

interface CardProps {
  children: React.ReactNode;
}

const Card = ({ children }: CardProps) => (
  <div className="overflow-hidden bg-white rounded-lg flex flex-col divide-y divide-cool-gray-200 gap-0 shadow-section">
    {children}
  </div>
);

export default Card;
