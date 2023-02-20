import React from 'react';
import i18n from '../common/config/i18n';
import Button from '../components/Button';
import PageLayout from '../layouts/PageLayout';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';

const ActivityCategories = () => {
  const navigate = useNavigate();

  const onAdd = () => {
    navigate('add');
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-between">
        <h1>{i18n.t('side_menu:options.activity_categories')}</h1>
        <Button
          label={i18n.t('general:add', { item: i18n.t('general:category').toLowerCase() })}
          className="btn-primary"
          icon={<PlusIcon className="h-5 w-5" />}
          onClick={onAdd}
        />
      </div>
      <Card>
        <CardHeader>
          <h2>{i18n.t('side_menu:options.activity_categories')}</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"></div>
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default ActivityCategories;
