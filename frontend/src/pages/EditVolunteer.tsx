import React, { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import FormDatePicker from '../components/FormDatePicker';
import FormInput from '../components/FormInput';
import PageHeader from '../components/PageHeader';
import Select, { SelectItem } from '../components/Select';
import Card from '../layouts/CardLayout';
import FormLayout from '../layouts/FormLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useUpdateVolunteerMutation,
  useVolunteerQuery,
} from '../services/volunteer/volunteer.service';
import LoadingContent from '../components/LoadingContent';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import EmptyContent from '../components/EmptyContent';

export type VolunteerFormData = {
  email: string;
  branch: SelectItem<string>;
  role: SelectItem<string>;
  department: SelectItem<string>;
  startedOn: Date;
};

const schema = yup.object({
  email: yup.string().email(`${i18n.t('general:error.email')}`),
  startedOn: yup.date().required(),
});

const EditVolunteer = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: volunteer,
    error: volunteerError,
    isLoading: isVolunteerLoading,
  } = useVolunteerQuery(id as string);
  const {
    mutateAsync: updateVolunteer,
    error: updateVolunteerError,
    isLoading: isUpdateVolunteerLoading,
  } = useUpdateVolunteerMutation();

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<VolunteerFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (volunteerError) {
      useErrorToast(
        InternalErrors.VOLUNTEER_ERRORS.getError(volunteerError?.response?.data.code_error),
      );
    }

    if (updateVolunteerError) {
      useErrorToast(
        InternalErrors.VOLUNTEER_ERRORS.getError(volunteerError?.response?.data.code_error),
      );
    }
  }, [volunteerError, updateVolunteerError]);

  const navigateBack = () => {
    navigate(`/volunteers/${id}`, { replace: true });
  };

  const onSubmit = (data: VolunteerFormData) => {
    console.log(data);
    if (volunteer)
      updateVolunteer(
        { id: volunteer.id, data },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t('volunteer:submit.success'));
            navigateBack();
          },
        },
      );
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:edit', { item: '' })}
      </PageHeader>
      {(isVolunteerLoading || isUpdateVolunteerLoading) && <LoadingContent />}
      {volunteer && !isVolunteerLoading && !isUpdateVolunteerLoading && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('volunteer:card_title')}</h2>
            <Button
              label={i18n.t('general:save_changes')}
              className="btn-primary shrink-0"
              onClick={handleSubmit(onSubmit)}
            />
          </CardHeader>
          <CardBody>
            <FormLayout>
              <form className="max-w-[30rem] relative left-1/2 -translate-x-1/2">
                <FormInput
                  type="text"
                  disabled
                  label={`${i18n.t('general:name')} ${i18n
                    .t('volunteer:name', { status: '' })
                    .toLowerCase()}`}
                  value={volunteer?.name}
                />
                <Controller
                  name="email"
                  key="email"
                  control={control}
                  defaultValue={volunteer.email}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <FormInput
                        type="email"
                        label={i18n.t('general:email')}
                        value={value}
                        onChange={onChange}
                        errorMessage={errors.email?.message as string}
                      />
                    );
                  }}
                />
                <hr className="border-cool-gray-200" />
                <Controller
                  name="branch"
                  key="branch"
                  control={control}
                  defaultValue={{ value: volunteer.branch, key: volunteer.branch }}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <div className="flex flex-col gap-1">
                        <Select
                          label={`${i18n.t('volunteer:branch')}`}
                          onChange={onChange}
                          defaultValue={value}
                          options={[
                            { value: volunteer.branch, key: volunteer.branch },
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
                  name="role"
                  key="role"
                  control={control}
                  defaultValue={{ value: volunteer.role, key: volunteer.role }}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <div className="flex flex-col gap-1">
                        <Select
                          label={`${i18n.t('division:entity.role')}`}
                          onChange={onChange}
                          defaultValue={value}
                          options={[
                            { value: volunteer.role, key: volunteer.role },
                            { value: 'Alba', key: 'alba' },
                            { value: 'Zapada', key: 'zapada' },
                            { value: 'Scufita', key: 'scufita' },
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
                  defaultValue={{ value: volunteer.department, key: volunteer.department }}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <div className="flex flex-col gap-1">
                        <Select
                          label={`${i18n.t('division:entity.department')}`}
                          onChange={onChange}
                          defaultValue={value}
                          options={[
                            { value: volunteer.department, key: volunteer.department },
                            { value: 'Caine', key: 'caine' },
                            { value: 'Dog', key: 'dog' },
                            { value: 'Hot Dog', key: 'hot' },
                          ]}
                        />
                      </div>
                    );
                  }}
                />
                <hr className="border-cool-gray-200" />
                <Controller
                  name="startedOn"
                  key="startedOn"
                  control={control}
                  defaultValue={volunteer.startedOn}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <FormDatePicker
                        label={`${i18n.t('volunteer:name', {
                          status: i18n.t('pagination:range_separator_text'),
                        })}`}
                        onChange={onChange}
                        value={value}
                      />
                    );
                  }}
                />
              </form>
            </FormLayout>
          </CardBody>
        </Card>
      )}
      {!volunteer && !isVolunteerLoading && !isUpdateVolunteerLoading && (
        <EmptyContent description={i18n.t('general:error.load_entries')} />
      )}
    </PageLayout>
  );
};

export default EditVolunteer;
