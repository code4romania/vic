import React from 'react';

interface CardBodyProps {
  children: React.ReactNode;
}

const CardBody = ({ children }: CardBodyProps) => (
  <div className="h-fit w-full sm:px-8 px-4 py-4">{children}</div>
);

export default CardBody;
