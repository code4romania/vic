import React from 'react';
import PageLayout from '../layouts/PageLayout';
import Button from '../components/Button';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import FormTextarea from '../components/FormTextarea';
import { useTranslation } from 'react-i18next';
// import { useParams } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

const EditOrganizationProfile = () => {
  const { t } = useTranslation(['organization', 'general', 'edit_organization']);

  // const { id } = useParams();

  return (
    <PageLayout>
      <div className="flex gap-4">
        <Button
          label={t('back', { ns: 'general' })}
          icon={<ChevronLeftIcon className="h-5 w-5 text-white" />}
          className="btn-secondary"
        />
        <h1>{t('title', { ns: 'edit_organization' })}</h1>
      </div>
      <Card>
        <CardHeader>
          <h2>{t('card_title', { ns: 'edit_organization' })}</h2>
          <Button label={t('save_changes', { ns: 'general' })} className="btn-primary" />
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-6 w-full lg:w-[80%] mx-auto pt-4 pb-16">
            <div className="flex flex-col gap-2">
              <h2>{t('description_title', { ns: 'organization' })}</h2>
              <p className="text-cool-gray-500">
                {t('description_placeholder', { ns: 'organization' })}
              </p>
            </div>
            <FormTextarea label={t('teo_description', { ns: 'edit_organization' })} />
          </div>
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default EditOrganizationProfile;
