import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import PageLayout from '../layouts/PageLayout';
import Button from '../components/Button';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import FormTextarea from '../components/FormTextarea';
import i18n from '../common/config/i18n';
import { useParams } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { useOrganizationDescriptionQuery } from '../services/edit-organization/EditOrganization.service';

const schema = yup.object({ description: yup.string() });

const EditOrganizationProfile = () => {
  const {} = useForm({ mode: 'onChange', reValidateMode: 'onChange', resolver });

  const { id } = useParams();
  const { data } = useOrganizationDescriptionQuery(id as string);

  return (
    <PageLayout>
      <div className="flex gap-4">
        <Button
          label={i18n.t('general:back')}
          icon={<ChevronLeftIcon className="h-5 w-5 text-white" />}
          className="btn-secondary"
        />
        <h1>{i18n.t('edit_organization:title')}</h1>
      </div>
      <Card>
        <CardHeader>
          <h2>{i18n.t('edit_organization:card_title')}</h2>
          <Button label={i18n.t('general:save_changes')} className="btn-primary" />
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-6 w-full lg:w-[80%] mx-auto pt-4 pb-16">
            <div className="flex flex-col gap-2">
              <h2>{i18n.t('organization:description_title')}</h2>
              <p className="text-cool-gray-500">{i18n.t('organization:description_placeholder')}</p>
            </div>
            <form>
              <FormTextarea
                label={i18n.t('edit_organization:teo_description')}
                defaultValue={data}
              />
            </form>
          </div>
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default EditOrganizationProfile;
