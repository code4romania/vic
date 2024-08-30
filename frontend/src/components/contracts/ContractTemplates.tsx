import React from 'react';
import PageLayout from '../../layouts/PageLayout';
import PageHeader from '../PageHeader';
import { useNavigate } from 'react-router-dom';
import CardHeader from '../CardHeader';
import Card from '../../layouts/CardLayout';
import CardBody from '../CardBody';
import Button from '../Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { OrganizationDetails } from './OrganizationDetails';
import { ContractTemplatePreview } from './ContractTemplatePreview';
import { useTranslation } from 'react-i18next';

export const ContractTemplates = () => {
  const navigate = useNavigate();

  const { t } = useTranslation('doc_templates');

  const navigateBack = () => {
    navigate('/documents/contracts', { replace: true });
  };

  // TODO: translations
  // TODO: links for <a/>

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{t('title')}</PageHeader>

      {/* sub header text */}
      <div className="flex flex-col gap-2">
        <p className="text-cool-gray-500">
          {t('subheading.p1') + ' '}
          {/* //TODO: href */}
          <a className="font-roboto text-yellow hover:text-yellow-600 hover:underline underline-offset-2">
            {t('subheading.p1_link')}
          </a>
        </p>
        <p className="text-cool-gray-500">
          {t('subheading.p2') + ' '} {/* //TODO: href */}
          <a className="font-roboto text-yellow hover:text-yellow-600 hover:underline underline-offset-2">
            {t('subheading.p2_link')}
          </a>
        </p>
      </div>

      {/* TABLE */}
      <Card>
        {/* TABLE HEADER */}
        <CardHeader>
          <div className="flex flex-row justify-between w-full items-center">
            <h2>{t('table_header.title')} </h2>
            <div className="flex flex-row gap-2">
              <Button
                label={t('table_header.download_uncompleted')}
                icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
                className="btn-outline-secondary text-cool-gray-600 "
                // TODO: descarca necompletat functionality
                onClick={() => {}}
              />
              {/* // TODO: save functionality */}
              <Button label={t('table_header.save')} className="btn-primary" />
            </div>
          </div>
        </CardHeader>

        {/* TABLE BODY */}
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row">
            <OrganizationDetails />
            <ContractTemplatePreview />
          </div>
        </CardBody>
      </Card>
    </PageLayout>
  );
  {
    /* {isLoading && <LoadingContent />} */
  }
};
