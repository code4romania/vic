import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MissingEntity from './MissingEntity';
import { useAppState } from '../store/app/app.selector';
import { useAuth } from '../hooks/useAuth';

// The API answered 503: the cutover window or a deploy. Retry asks again; another 503 brings
// this screen back.
const Maintenance = () => {
  const { t } = useTranslation('maintenance');
  const { setMaintenance } = useAppState();
  const { reload } = useAuth();
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const onRetry = async () => {
    if (isRetrying) {
      return;
    }
    setIsRetrying(true);
    setMaintenance(false);
    try {
      await reload();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <MissingEntity
      heading={t('heading')}
      paragraph={t('paragraph')}
      actionBtnLabel={t('retry')}
      onActionBtnPress={onRetry}
    />
  );
};

export default Maintenance;
