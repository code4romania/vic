import React from 'react';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import CardHeader from '../components/CardHeader';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import FormLayout from '../layouts/FormLayout';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormInput from '../components/FormInput';
import Select, { SelectItem } from '../components/Select';
import { useCreateActivityCategoryMutation } from '../services/activity-category/activity-categories.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import LoadingContent from '../components/LoadingContent';

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
      .required(`${i18n.t('division:form.name.required')}`)
      .min(2, `${i18n.t('division:form.name.min', { value: '2' })}`)
      .max(
        20,
        `${i18n.t('division:form.name.max', {
          value: '50',
        })}`,
      ),
  })
  .required();

const AddActivity = () => {
  const navigate = useNavigate();

  const { mutateAsync: createActivityCategory, isLoading: isCreateActivityCategoryLoading } =
    useCreateActivityCategoryMutation();

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
    navigate('/activity-categories', { replace: true });
  };

  const saveChanges = (data: ActivityCategoryFormTypes) => {
    createActivityCategory(data, {
      onSuccess: () => {
        useSuccessToast(
          i18n.t('division:messages.add', {
            division: i18n.t('general:activity'),
          }),
        );
        navigateBack();
      },
      onError: (error) => {
        useErrorToast(
          InternalErrors.ACTIVITY_CATEGORY_ERRORS.getError(error.response?.data.code_error),
        );
      },
    });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:add', { item: '' })}
      </PageHeader>
      {isCreateActivityCategoryLoading && <LoadingContent />}
      {!isCreateActivityCategoryLoading && (
        <Card>
          <CardHeader>
            <h2>{`${i18n.t('general:category')} ${i18n.t('general:activity').toLowerCase()}`}</h2>
            <Button
              label={i18n.t('general:save_changes')}
              className="btn-primary"
              onClick={handleSubmit(saveChanges)}
            />
          </CardHeader>
          <CardBody>
            <FormLayout>
              <form className="max-w-[30rem]">
                <Controller
                  key="name"
                  name="name"
                  control={control}
                  defaultValue=""
                  render={({ field: { onChange, value } }) => {
                    return (
                      <FormInput
                        type="text"
                        readOnly={false}
                        value={value}
                        errorMessage={errors['name']?.message as string}
                        label={i18n.t('activity_categories:type')}
                        placeholder={`${i18n.t('activity_categories:type_placeholder')}`}
                        onChange={onChange}
                        aria-invalid={errors['name']?.message ? 'true' : 'false'}
                        id="add-activity-form__name"
                      />
                    );
                  }}
                />
                <Controller
                  key="icon"
                  name="icon"
                  control={control}
                  defaultValue="logo.svg"
                  render={({ field: { onChange, value } }) => {
                    return (
                      <FormInput
                        type="text"
                        value={value}
                        errorMessage={errors['icon']?.message as string}
                        label={i18n.t('general:choose', {
                          item: i18n.t('general:image').toLowerCase(),
                        })}
                        onChange={onChange}
                        aria-invalid={errors['icon']?.message ? 'true' : 'false'}
                        id="add-activity-form__icon"
                      />
                    );
                  }}
                />
                <Controller
                  name="branch"
                  key="branch"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <div className="flex flex-col gap-1">
                        <Select
                          label={`${i18n.t('division:entity.branch')}`}
                          placeholder={`${i18n.t('general:select', { item: '' })}`}
                          onChange={onChange}
                          defaultValue={value}
                          options={[
                            { value: 'Otelul', key: 'otelul' },
                            { value: 'Galati', key: 'galati' },
                            { value: 'Carpati', key: 'carpati' },
                          ]}
                        />
                      </div>
                    );
                  }}
                />
                <Controller
                  name="department"
                  key="department"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <div className="flex flex-col gap-1">
                        <Select
                          label={`${i18n.t('division:entity.department')}`}
                          placeholder={`${i18n.t('general:select', { item: '' })}`}
                          onChange={onChange}
                          defaultValue={value}
                          options={[
                            { value: 'Caine', key: 'caine' },
                            { value: 'Dog', key: 'dog' },
                            { value: 'Hot Dog', key: 'hot' },
                          ]}
                        />
                      </div>
                    );
                  }}
                />
                <Controller
                  name="role"
                  key="role"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <div className="flex flex-col gap-1">
                        <Select
                          label={`${i18n.t('division:entity.role')}`}
                          placeholder={`${i18n.t('general:select', { item: '' })}`}
                          onChange={onChange}
                          defaultValue={value}
                          options={[
                            { value: 'Alba', key: 'alba' },
                            { value: 'Zapada', key: 'zapada' },
                            { value: 'Scufita', key: 'scufita' },
                          ]}
                        />
                      </div>
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

export default AddActivity;
