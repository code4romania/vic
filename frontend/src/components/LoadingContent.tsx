import React from 'react';
import i18n from '../common/config/i18n';

// A navy ring while data loads, with a short text next to it.
const LoadingContent = () => {
  return (
    <div aria-busy="true" className="w-full flex items-center justify-center gap-3 py-6">
      <span
        aria-hidden="true"
        className="w-6 h-6 rounded-full border-[3px] border-cool-gray-200 border-t-navy animate-spin"
      />
      <span className="text-sm text-cool-gray-500">{i18n.t('states:loading')}</span>
    </div>
  );
};

export default LoadingContent;
