import React from 'react';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import CardHeader from '../components/CardHeader';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import LoadingContent from '../components/LoadingContent';
import { useCreateActivityTypeMutation } from '../services/activity-type/activity-type.service';
import ActivityTypeForm, { ActivityCategoryFormTypes } from '../components/ActivityTypeForm';

const schema = yup
  .object({
    name: yup
      .string()
      .required(`${i18n.t('activity_types:form.name.required')}`)
      .min(2, `${i18n.t('activity_types:form.name.min', { value: '2' })}`)
      .max(
        50,
        `${i18n.t('activity_types:form.name.max', {
          value: '50',
        })}`,
      ),
  })
  .required();

const AddActivityType = () => {
  const navigate = useNavigate();

  const { mutateAsync: createActivityType, isLoading: isCreatingActivityType } =
    useCreateActivityTypeMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ActivityCategoryFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const navigateBack = () => {
    navigate('/activity-types', { replace: true });
  };

  const onSubmit = (data: ActivityCategoryFormTypes) => {
    createActivityType(data, {
      onSuccess: () => {
        useSuccessToast(i18n.t('activity_types:form.submit.add'));
        navigateBack();
      },
      onError: (error) => {
        useErrorToast(
          InternalErrors.ACTIVITY_TYPE_ERRORS.getError(error.response?.data.code_error),
        );
      },
    });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:add', { item: '' })}
      </PageHeader>
      {isCreatingActivityType && <LoadingContent />}
      {!isCreatingActivityType && (
        <Card>
          <CardHeader>
            <h2>{`${i18n.t('general:category')} ${i18n.t('general:activity').toLowerCase()}`}</h2>
            <Button
              label={i18n.t('general:save_changes')}
              className="btn-primary"
              onClick={handleSubmit(onSubmit)}
            />
          </CardHeader>
          <CardBody>
            <ActivityTypeForm control={control} errors={errors} />
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default AddActivityType;
