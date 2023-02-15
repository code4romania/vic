import React from 'react';
import { useNavigate } from 'react-router';
import i18n from '../common/config/i18n';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';

const Volunteer = () => {
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate('/volunteers', { replace: true });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{i18n.t('volunteer:title')}</PageHeader>
    </PageLayout>
  );
};

export default Volunteer;
