import React from 'react';
import i18n from '../common/config/i18n';

const EmptyContent = () => {
  return (
    <span role="row" className="p-8 sm:text-sm lg:text-base text-xs">
      {i18n.t('general:empty_table')}
    </span>
  );
};

export default EmptyContent;
