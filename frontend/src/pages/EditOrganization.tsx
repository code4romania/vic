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
import {
  useOrganizationQuery,
  useUpdateOrganizationDescriptionMutation,
} from '../services/organization/organization.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { useNavigate } from 'react-router';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import { InternalErrors } from '../common/errors/internal-errors.class';
import PageHeader from '../components/PageHeader';
import FormLayout from '../layouts/FormLayout';
import Paragraph from '../components/Paragraph';

const schema = yup
  .object({
    description: yup
      .string()
      .required(`${i18n.t('organization:form.description.required')}`)
      .min(
        50,
        `${i18n.t('organization:form.description.min', {
          value: '50',
        })}`,
      )
      .max(
        250,
        `${i18n.t('organization:form.description.max', {
          value: '250',
        })}`,
      ),
  })
  .required();

type OrganizationFormType = {
  description: string;
};

const EditOrganization = () => {
  const navigate = useNavigate();

  // load organization data
  const {
    data: organization,
    error: organizationError,
    isLoading: isOrganizationLoading,
  } = useOrganizationQuery();

  // submit form data
  const {
    mutateAsync: updateOrganizationDescription,
    isLoading: isUpdateDescriptionLoading,
    error: updateOrganizationDescriptionError,
  } = useUpdateOrganizationDescriptionMutation();

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<OrganizationFormType>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    // prefill form
    if (organization) reset({ description: organization.description });
  }, [organization]);

  const onSubmit = ({ description }: OrganizationFormType) => {
    updateOrganizationDescription(description, {
      onSuccess: () => {
        useSuccessToast(i18n.t('organization:submit.success'));
        navigate('/organization', { replace: true });
      },
    });
  };

  useEffect(() => {
    if (organizationError)
      useErrorToast(
        InternalErrors.ORGANIZATION_ERRORS.getError(organizationError.response?.data.code_error),
      );

    if (updateOrganizationDescriptionError)
      useErrorToast(
        InternalErrors.ORGANIZATION_ERRORS.getError(
          updateOrganizationDescriptionError.response?.data.code_error,
        ),
      );
  }, [organizationError, updateOrganizationDescriptionError]);

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigate.bind(null, -1)}>
        {i18n.t('organization:title.edit')}
      </PageHeader>
      {(isOrganizationLoading || isUpdateDescriptionLoading) && <LoadingContent />}
      {organizationError && !organization && (
        <EmptyContent description={i18n.t('organization:errors.no_data')} />
      )}
      {organization && !isUpdateDescriptionLoading && !isOrganizationLoading && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('organization:title.card')}</h2>
            <Button
              label={i18n.t('general:save_changes')}
              className="btn-primary"
              onClick={handleSubmit(onSubmit)}
            />
          </CardHeader>
          <CardBody>
            <FormLayout>
              <Paragraph title={i18n.t('organization:description')}>
                {i18n.t('organization:description_placeholder')}
              </Paragraph>
              <form>
                <Controller
                  name="description"
                  key="description"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <FormTextarea
                        label={i18n.t('organization:teo_description')}
                        defaultValue={value}
                        value={value}
                        onChange={onChange}
                        errorMessage={errors.description?.message as string}
                      />
                    );
                  }}
                />
              </form>
            </FormLayout>
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default EditOrganization;
