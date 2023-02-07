import React from 'react';
import Spinner from './Spinner';

const LoadingContent = () => {
  return (
    <div className="text-center">
      <Spinner className="inline w-8 h-8 mr-2" />
    </div>
  );
};

export default LoadingContent;
