import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';
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
import { REGEX } from '../common/constants/patterns';
import { useForm } from 'react-hook-form';
import {
  useAccessCodeQuery,
  useUpdateAccessCodeMutation,
} from '../services/organization/organization.service';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import LoadingContent from '../components/LoadingContent';

const validationSchema = yup.object({
  code: yup
    .string()
    .required(`${i18n.t('general:validation.required')}`)
    .min(2, `${i18n.t('access_codes:validation.min')}`)
    .max(10, `${i18n.t('access_codes:validation.max')}`)
    .matches(REGEX.NAME_REGEX, `${i18n.t('general:validation:pattern')}`),
  startDate: yup.date().required(`${i18n.t('general:validation.required')}`),
  endDate: yup.date().optional(),
});

const EditAccessCode = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: accessCode } = useAccessCodeQuery(id as string);
  const { mutateAsync: updateAccessCodeMutation, isLoading } = useUpdateAccessCodeMutation();

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

  const onNavigateBack = () => {
    navigate(-1);
  };

  const onSave = (inputData: AccessCodeFormTypes) => {
    if (accessCode) {
      updateAccessCodeMutation(
        { id: accessCode.id, endDate: inputData.endDate },
        {
          onError: (error) =>
            useErrorToast(
              InternalErrors.ORGANIZATION_ERRORS.getError(error.response?.data.code_error),
            ),
        },
      );
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-row gap-4">
        <Button
          className="btn-secondary"
          label={i18n.t('general:back')}
          icon={<ChevronLeftIcon className="h-5 w-5" />}
          onClick={onNavigateBack}
        />
        <h1>{i18n.t('general:edit', { item: i18n.t('access_codes:name').toLocaleLowerCase() })}</h1>
      </div>
      {isLoading && <LoadingContent />}
      {!isLoading && (
        <Card>
          <CardHeader>
            <h3>{i18n.t('access_codes:name')}</h3>
            <Button
              label={i18n.t('confirmation:save')}
              className="btn-primary"
              onClick={handleSubmit(onSave)}
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
