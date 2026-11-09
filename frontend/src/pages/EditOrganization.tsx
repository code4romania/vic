import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router';
import PageLayout from '../layouts/PageLayout';
import Button from '../components/Button';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import i18n from '../common/config/i18n';
import {
  useOrganizationQuery,
  useUpdateOrganizationMutation,
} from '../services/organization/organization.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import { InternalErrors } from '../common/errors/internal-errors.class';
import PageHeader from '../components/PageHeader';
import FormLayout from '../layouts/FormLayout';
import Paragraph from '../components/Paragraph';
import {
  OrganizationFields,
  OrganizationLogo,
  organizationProfileSchema,
} from '../components/OrganizationFields';
import { IOrganizationFields } from '../common/interfaces/organization.interface';

const schema = yup.object(organizationProfileSchema).required();

// #469: name, CUI, email, phone, address, website, description and a new logo. The NGO Hub sync is gone.
const EditOrganization = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<File | null>(null);

  const {
    data: organization,
    error: organizationError,
    isLoading: isOrganizationLoading,
  } = useOrganizationQuery();

  const { mutate: updateOrganization, isLoading: isUpdateLoading } =
    useUpdateOrganizationMutation();

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<Required<IOrganizationFields>>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (organization)
      reset({
        name: organization.name,
        email: organization.email,
        phone: organization.phone,
        taxId: organization.taxId ?? '',
        address: organization.address ?? '',
        website: organization.website ?? '',
        description: organization.description ?? '',
      });
  }, [organization]);

  useEffect(() => {
    if (organizationError)
      useErrorToast(
        InternalErrors.ORGANIZATION_ERRORS.getError(organizationError.response?.data.code_error),
      );
  }, [organizationError]);

  const onSubmit = (data: Required<IOrganizationFields>) => {
    updateOrganization(
      { data, files: { logo } },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t('organization:submit.success'));
          navigate('/organization', { replace: true });
        },
        onError: (error) => {
          useErrorToast(
            InternalErrors.ORGANIZATION_ERRORS.getError(error.response?.data.code_error),
          );
        },
      },
    );
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigate.bind(null, -1)}>
        {i18n.t('organization:title.edit')}
      </PageHeader>
      {(isOrganizationLoading || isUpdateLoading) && <LoadingContent />}
      {organizationError && !organization && (
        <EmptyContent description={i18n.t('organization:errors.no_data')} />
      )}
      {organization && !isUpdateLoading && !isOrganizationLoading && (
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
              <Paragraph title={i18n.t('organization:title.view')}>
                {i18n.t('organization:description_placeholder')}
              </Paragraph>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <OrganizationFields control={control} errors={errors} withProfile />
                <OrganizationLogo onLogo={setLogo} logoLabel={i18n.t('organization:replace_logo')} />
              </form>
            </FormLayout>
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default EditOrganization;
