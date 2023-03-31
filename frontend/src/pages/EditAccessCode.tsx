import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import AccessCodeForm, { AccessCodeFormTypes } from '../components/AccessCodeForm';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
  useAccessCodeQuery,
  useUpdateAccessCodeMutation,
} from '../services/organization/organization.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

const validationSchema = yup.object({
  endDate: yup
    .date()
    .typeError(`${i18n.t('general:invalid_date')}`)
    .nullable()
    .optional(),
});

const EditAccessCode = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: accessCode, error: accessCodeError } = useAccessCodeQuery(id as string);
  const { mutateAsync: updateAccessCode, isLoading } = useUpdateAccessCodeMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<AccessCodeFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (accessCodeError) {
      // error while retrieving the access code data from the database
      useErrorToast(
        InternalErrors.ORGANIZATION_ERRORS.getError(accessCodeError.response?.data.code_error),
      );
      onNavigateBack();
    }
  }, [accessCodeError]);

  const onNavigateBack = () => {
    navigate('/volunteers/access-codes');
  };

  const onSubmit = ({ endDate }: AccessCodeFormTypes) => {
    if (accessCode) {
      updateAccessCode(
        { id: accessCode.id, endDate },
        {
          onError: (error) => {
            useErrorToast(
              InternalErrors.ORGANIZATION_ERRORS.getError(error.response?.data.code_error),
            );
          },
          onSuccess: () => {
            useSuccessToast(i18n.t('access_code:submit.success.edit'));
            onNavigateBack();
          },
        },
      );
    }
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onNavigateBack}>
        {i18n.t('general:edit', { item: i18n.t('access_code:name').toLocaleLowerCase() })}
      </PageHeader>
      {isLoading && <LoadingContent />}
      {!isLoading && (
        <Card>
          <CardHeader>
            <h4 className="text-sm sm:text-xl">{i18n.t('access_code:name')}</h4>
            <Button
              label={i18n.t('general:save_changes')}
              className="btn-primary"
              icon={<CloudArrowUpIcon className="h-5 w-5 sm:hidden" />}
              onClick={handleSubmit(onSubmit)}
            />
          </CardHeader>
          <CardBody>
            <AccessCodeForm
              control={control}
              errors={errors}
              disabled={true}
              accessCode={accessCode}
              reset={reset}
            />
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default EditAccessCode;
