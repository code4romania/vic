import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth/AuthContext';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const { t } = useTranslation('general');

  return (
    <div>
      This is the Dashboard <button onClick={logout}>logout</button>
      <h1>Translation test {t('test')}</h1>
    </div>
  );
};

export default Dashboard;
