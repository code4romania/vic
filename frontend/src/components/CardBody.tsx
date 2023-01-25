import React from 'react';

interface CardBodyProps {
  children: React.ReactNode;
}

const CardBody = ({ children }: CardBodyProps) => (
  <div className="h-fit w-full px-8 py-4">{children}</div>
);

export default CardBody;
