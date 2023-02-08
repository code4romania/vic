import React from 'react';

interface EmptyContentProps {
  description: string;
}

const EmptyContent = ({ description }: EmptyContentProps) => {
  return (
    <span role="row" className="text-center p-8 sm:text-sm lg:text-base text-xs">
      {description}
    </span>
  );
};

export default EmptyContent;
