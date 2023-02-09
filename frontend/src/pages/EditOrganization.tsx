import React, { useEffect } from 'react';
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
import {
  useOrganizationForEditQuery,
  useUpdateOrganizationDescriptionMutation,
} from '../services/organization/organization.service';
import { useErrorToast } from '../hooks/useToast';
import { useNavigate } from 'react-router';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';

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

const EditOrganization = () => {
  const navigate = useNavigate();

  const { mutateAsync: updateOrganizationDescription, isLoading: isUpdateDescriptionLoading } =
    useUpdateOrganizationDescriptionMutation();

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<OrganizationTypeInput>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const {
    data: organization,
    error,
    isLoading: isOrganizationLoading,
  } = useOrganizationForEditQuery();

  const navigateBack = () => {
    navigate(-1);
  };

  const handleFormSubmit = (data: OrganizationTypeInput) => {
    updateOrganizationDescription(data.description, {
      onSuccess: () => navigateBack(),
      onError: () => useErrorToast(i18n.t('edit_organization:form.description_error')),
    });
  };

  useEffect(() => {
    if (error) useErrorToast(i18n.t('general:error.load_entries'));
  }, [error]);

  return (
    <PageLayout>
      <div className="flex gap-4 items-center">
        <Button
          label={i18n.t('general:back')}
          icon={<ChevronLeftIcon className="h-5 w-5 text-white" />}
          className="btn-secondary"
          onClick={navigateBack}
        />
        <h1>{i18n.t('edit_organization:title')}</h1>
      </div>
      {isOrganizationLoading && <LoadingContent />}
      {error && <EmptyContent description={i18n.t('general:error.load_entries')} />}
      {organization && (
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
            <div className="flex flex-col gap-6 w-full lg:w-[80%] mx-auto sm:pt-4 pb-16">
              <div className="flex flex-col gap-2">
                <h2>{i18n.t('organization:description_title')}</h2>
                <p className="text-cool-gray-500">
                  {i18n.t('organization:description_placeholder')}
                </p>
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
                        defaultValue={value || organization.description}
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
      )}
      {isUpdateDescriptionLoading && <LoadingContent />}
    </PageLayout>
  );
};

export default EditOrganization;
