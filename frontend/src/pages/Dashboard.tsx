import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTestValuesQuery } from '../services/test/test.service';

const Dashboard = () => {
  const { logout } = useAuth();
  // for testing purpose only
  const { t } = useTranslation('general');
  // for testing purpos only
  const { data } = useTestValuesQuery();

  return (
    <div>
      This is the Dashboard <button onClick={logout}>logout</button>
      <h1>Translation test {t('test')}</h1>
      <p>{JSON.stringify(data)}</p>
    </div>
  );
};

export default Dashboard;
