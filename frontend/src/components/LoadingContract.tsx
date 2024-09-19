import React from 'react';
import Spinner from './Spinner';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export const LoadingContract = () => {
  return (
    <div className="flex flex-row justify-center items-center">
      <div className="justify-center items-center relative">
        <Spinner className="w-20 h-20" />
        <DocumentTextIcon
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300"
          width={30}
          height={30}
        />
      </div>
    </div>
  );
};
