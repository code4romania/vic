import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useCreateAccessCodesMutation } from '../services/organization/organization.service';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';

const validationSchema = yup.object({
  code: yup
    .string()
    .required(`${i18n.t('access_code:form.code.required')}`)
    .min(
      2,
      `${i18n.t('access_code:form.code.min', {
        value: '2',
      })}`,
    )
    .max(
      10,
      `${i18n.t('access_code:form.code.max', {
        value: '10',
      })}`,
    )
    .matches(REGEX.NAME_REGEX, `${i18n.t('access_code:form.code.pattern')}`),
  startDate: yup
    .date()
    .typeError(`${i18n.t('general:invalid_date')}`)
    .required(`${i18n.t('access_code:form.start_date.required')}`),
  endDate: yup
    .date()
    .typeError(`${i18n.t('general:invalid_date')}`)
    .optional(),
});

const AddAccessCode = () => {
  const navigate = useNavigate();

  const { mutateAsync: createAccessCodeMutation, isLoading } = useCreateAccessCodesMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AccessCodeFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  const onNavigateBack = () => {
    navigate('/volunteers/access-codes');
  };

  const onSave = (inputData: AccessCodeFormTypes) => {
    createAccessCodeMutation(inputData, {
      onError: (error) =>
        useErrorToast(
          InternalErrors.ORGANIZATION_ERRORS.getError(error?.response?.data.code_error),
        ),
    });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onNavigateBack}>
        {i18n.t('general:add', { item: i18n.t('access_code:name').toLocaleLowerCase() })}
      </PageHeader>
      {isLoading && <LoadingContent />}
      {!isLoading && (
        <Card>
          <CardHeader>
            <h4 className="text-sm sm:text-xl">{i18n.t('access_code:name')}</h4>
            <Button
              label={i18n.t('general:save_changes')}
              className="btn-primary"
              onClick={handleSubmit(onSave)}
            />
          </CardHeader>
          <CardBody>
            <AccessCodeForm control={control} errors={errors} />
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default AddAccessCode;
