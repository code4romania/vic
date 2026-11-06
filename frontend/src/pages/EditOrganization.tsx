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
  isPdf,
  OrganizationFields,
  OrganizationFiles,
  organizationFieldsSchema,
} from '../components/OrganizationFields';
import { IOrganizationFields } from '../common/interfaces/organization.interface';
import { ORGANIZATION_ERRORS } from '../common/errors/entities/organization.errors';

const schema = yup.object(organizationFieldsSchema).required();

// Every organization field, a new logo and a new statute (W3). The NGO Hub sync is gone.
const EditOrganization = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<File | null>(null);
  const [statute, setStatute] = useState<File | null>(null);
  const [statuteError, setStatuteError] = useState<string>();

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
  } = useForm<IOrganizationFields>({
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
        address: organization.address,
        activityArea: organization.activityArea,
        description: organization.description,
        website: organization.website ?? '',
        taxId: organization.taxId ?? '',
      });
  }, [organization]);

  useEffect(() => {
    if (organizationError)
      useErrorToast(
        InternalErrors.ORGANIZATION_ERRORS.getError(organizationError.response?.data.code_error),
      );
  }, [organizationError]);

  const onSubmit = (data: IOrganizationFields) => {
    if (statute && !isPdf(statute)) {
      setStatuteError(i18n.t('register_organization:form.statute.rejected'));
      return;
    }
    updateOrganization(
      { data, files: { logo, statute } },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t('organization:submit.success'));
          navigate('/organization', { replace: true });
        },
        onError: (error) => {
          const code = error.response?.data.code_error;
          if (code === ORGANIZATION_ERRORS.ORG_007) {
            setStatuteError(InternalErrors.ORGANIZATION_ERRORS.getError(code));
            return;
          }
          useErrorToast(InternalErrors.ORGANIZATION_ERRORS.getError(code));
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
                <OrganizationFields control={control} errors={errors} />
                <OrganizationFiles
                  onLogo={setLogo}
                  onStatute={(file) => {
                    setStatute(file);
                    setStatuteError(undefined);
                  }}
                  statuteError={statuteError}
                  logoLabel={i18n.t('organization:replace_logo')}
                  statuteLabel={i18n.t('organization:replace_statute')}
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
