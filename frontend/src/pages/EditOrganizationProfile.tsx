import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import PageLayout from '../layouts/PageLayout';
import Button from '../components/Button';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import FormTextarea from '../components/FormTextarea';
import i18n from '../common/config/i18n';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { useOrganizationDescriptionQuery } from '../services/edit-organization/EditOrganization.service';
import { useNavigate } from 'react-router';

const schema = yup
  .object({
    description: yup
      .string()
      .required(`${i18n.t('general:required')}`)
      .min(50, `${i18n.t('edit_organization:form.min')}`)
      .max(250, `${i18n.t('edit_organization:form.max')}`),
  })
  .required();

type OrganizationTypeInput = {
  description: string;
};

const EditOrganizationProfile = () => {
  const navigate = useNavigate();

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<OrganizationTypeInput>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { data: organizationDescription, error: OrganizationDescriptionError } =
    useOrganizationDescriptionQuery();

  const handleFormSubmit = (data: OrganizationTypeInput) => {
    console.log(OrganizationDescriptionError);
    console.log(data);
  };

  const navigateBack = () => {
    navigate(-1);
  };

  return (
    <PageLayout>
      <div className="flex gap-4">
        <Button
          label={i18n.t('general:back')}
          icon={<ChevronLeftIcon className="h-5 w-5 text-white" />}
          className="btn-secondary"
          onClick={navigateBack}
        />
        <h1>{i18n.t('edit_organization:title')}</h1>
      </div>
      <Card>
        <CardHeader>
          <h2>{i18n.t('edit_organization:card_title')}</h2>
          <Button
            label={i18n.t('general:save_changes')}
            className="btn-primary"
            onClick={handleSubmit(handleFormSubmit)}
          />
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-6 w-full lg:w-[80%] mx-auto pt-4 pb-16">
            <div className="flex flex-col gap-2">
              <h2>{i18n.t('organization:description_title')}</h2>
              <p className="text-cool-gray-500">{i18n.t('organization:description_placeholder')}</p>
            </div>
            <form>
              <Controller
                name="description"
                key="description"
                control={control}
                render={({ field: { onChange, value } }) => {
                  return (
                    <FormTextarea
                      label={i18n.t('edit_organization:teo_description')}
                      defaultValue={value || organizationDescription}
                      onChange={onChange}
                      errorMessage={errors.description?.message as string}
                    />
                  );
                }}
              />
            </form>
          </div>
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default EditOrganizationProfile;
