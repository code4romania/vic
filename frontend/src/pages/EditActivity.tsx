import React from 'react';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';

const EditActivity = () => {
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate('/activity-categories', { replace: true });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:edit', { item: '' })}
      </PageHeader>
    </PageLayout>
  );
};

export default EditActivity;
