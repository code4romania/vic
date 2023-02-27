import React, { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import CardHeader from '../components/CardHeader';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SelectItem } from '../components/Select';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import LoadingContent from '../components/LoadingContent';
import EmptyContent from '../components/EmptyContent';
import {
  useActivityTypeQuery,
  useUpdateActivityTypeMutation,
} from '../services/activity-type/activity-type.service';
import ActivityTypeForm from '../components/ActivityTypeForm';
import { mapDivisionListItemToSelectItem } from '../containers/OrganizationStructureSelect';

export type ActivityCategoryFormTypes = {
  name: string;
  icon: string;
  department?: SelectItem<string>;
  branch?: SelectItem<string>;
  role?: SelectItem<string>;
};

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

const EditActivityType = () => {
  // get query params
  const { id } = useParams();
  const navigate = useNavigate();

  // query
  const {
    data: activityType,
    error: activityTypeError,
    isLoading: isFetchingActivityType,
  } = useActivityTypeQuery(id as string);
  // mutation
  const { mutateAsync: updateActivityType, isLoading: isUpdateingActivityType } =
    useUpdateActivityTypeMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ActivityCategoryFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (activityType) {
      const { role, department, branch, ...data } = activityType;
      // preload form data
      reset({
        ...data,
        ...(branch ? { branch: mapDivisionListItemToSelectItem(branch) } : {}),
        ...(department ? { department: mapDivisionListItemToSelectItem(department) } : {}),
        ...(role ? { role: mapDivisionListItemToSelectItem(role) } : {}),
      });
    }
  }, [activityType]);

  // error while loading the activity type
  useEffect(() => {
    if (activityTypeError) {
      useErrorToast(
        InternalErrors.ACTIVITY_TYPE_ERRORS.getError(activityTypeError?.response?.data.code_error),
      );
    }
  }, [activityTypeError]);

  const onBackButtonPress = () => {
    navigate('/activity-types', { replace: true });
  };

  const onSubmit = (data: ActivityCategoryFormTypes) => {
    if (activityType)
      updateActivityType(
        { id: activityType.id, data },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t('activity_types:form.submit.update'));
            onBackButtonPress();
          },
          onError: (error) => {
            useErrorToast(
              InternalErrors.ACTIVITY_TYPE_ERRORS.getError(error.response?.data.code_error),
            );
          },
        },
      );
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onBackButtonPress}>
        {i18n.t('general:edit', { item: '' })}
      </PageHeader>
      {(isFetchingActivityType || isUpdateingActivityType) && <LoadingContent />}
      {activityType && !isFetchingActivityType && !isUpdateingActivityType && (
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
      {!activityType && !isFetchingActivityType && !isUpdateingActivityType && (
        <EmptyContent description={i18n.t('general:error.load_entries')} />
      )}
    </PageLayout>
  );
};

export default EditActivityType;
