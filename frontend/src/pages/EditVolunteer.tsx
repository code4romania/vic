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
import { SelectItem } from '../components/Select';
import Card from '../layouts/CardLayout';
import FormLayout from '../layouts/FormLayout';
import PageLayout from '../layouts/PageLayout';
import { useUpdateVolunteerMutation, useVolunteer } from '../services/volunteer/volunteer.service';
import LoadingContent from '../components/LoadingContent';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import EmptyContent from '../components/EmptyContent';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { DivisionType } from '../common/enums/division-type.enum';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { mapDivisionListItemToSelectItem } from '../common/utils/utils';

export type VolunteerFormTypes = {
  name: string;
  email: string;
  branch?: SelectItem<string>;
  role?: SelectItem<string>;
  department?: SelectItem<string>;
  activeSince?: Date;
};

const schema = yup.object({
  name: yup.string().required(),
  email: yup
    .string()
    .email(`${i18n.t('volunteer:form.email.pattern')}`)
    .max(75, `${i18n.t('volunteer:form.email.max')}`)
    .required(`${i18n.t('volunteer:form.email.required')}`),
  activeSince: yup
    .date()
    .optional()
    .typeError(`${i18n.t('general:invalid_date')}`),
});

const EditVolunteer = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: volunteer,
    error: volunteerError,
    isLoading: isVolunteerLoading,
  } = useVolunteer(id as string);

  const { mutateAsync: updateVolunteer, isLoading: isUpdateVolunteerLoading } =
    useUpdateVolunteerMutation();

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<VolunteerFormTypes>({
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
  }, [volunteerError]);

  useEffect(() => {
    // init form data
    if (volunteer) {
      const { profile, ...data } = volunteer;
      // preload form data
      reset({
        name: data.user.name,
        email: profile?.email,
        activeSince: profile?.activeSince ? new Date(profile?.activeSince) : undefined,
        ...(profile?.branch ? { branch: mapDivisionListItemToSelectItem(profile?.branch) } : {}),
        ...(profile?.department
          ? { department: mapDivisionListItemToSelectItem(profile?.department) }
          : {}),
        ...(profile?.role ? { role: mapDivisionListItemToSelectItem(profile?.role) } : {}),
      });
    }
  }, [volunteer]);

  const onBackButtonPress = () => {
    navigate(`/volunteers/${id}`, { replace: true });
  };

  const onSubmit = (data: VolunteerFormTypes) => {
    if (volunteer)
      updateVolunteer(
        { id: volunteer.id, data },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t('volunteer:form.submit.edit'));
            onBackButtonPress();
          },
          onError: (error) => {
            useErrorToast(
              InternalErrors.VOLUNTEER_ERRORS.getError(error?.response?.data.code_error),
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
      {(isVolunteerLoading || isUpdateVolunteerLoading) && <LoadingContent />}
      {volunteer && !isVolunteerLoading && !isUpdateVolunteerLoading && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('volunteer:card_title')}</h2>
            <Button
              label={i18n.t('general:save_changes')}
              className="btn-primary shrink-0"
              icon={<CloudArrowUpIcon className="h-5 w-5 sm:hidden" />}
              onClick={handleSubmit(onSubmit)}
            />
          </CardHeader>
          <CardBody>
            <FormLayout>
              <form className="max-w-[30rem] relative left-1/2 -translate-x-1/2">
                <Controller
                  name="name"
                  key="name"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <FormInput
                        type="text"
                        disabled
                        label={`${i18n.t('volunteer:form.name.label')}`}
                        value={value}
                        onChange={onChange}
                      />
                    );
                  }}
                />
                <Controller
                  name="email"
                  key="email"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <FormInput
                        type="email"
                        label={`${i18n.t('volunteer:form.email.label')}`}
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
                  render={({ field: { onChange, value } }) => {
                    return (
                      <OrganizationStructureSelect
                        label={`${i18n.t('volunteer:form.branch.label')}`}
                        placeholder={`${i18n.t('general:select', { item: '' })}`}
                        onChange={onChange}
                        selected={value}
                        type={DivisionType.BRANCH}
                      />
                    );
                  }}
                />
                <Controller
                  name="department"
                  key="department"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <OrganizationStructureSelect
                        label={`${i18n.t('volunteer:form.department.label')}`}
                        placeholder={`${i18n.t('general:select', { item: '' })}`}
                        onChange={onChange}
                        selected={value}
                        type={DivisionType.DEPARTMENT}
                      />
                    );
                  }}
                />
                <Controller
                  name="role"
                  key="role"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <OrganizationStructureSelect
                        label={`${i18n.t('volunteer:form.role.label')}`}
                        placeholder={`${i18n.t('general:select', { item: '' })}`}
                        onChange={onChange}
                        selected={value}
                        type={DivisionType.ROLE}
                      />
                    );
                  }}
                />
                <hr className="border-cool-gray-200" />
                <Controller
                  name="activeSince"
                  key="activeSince"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <FormDatePicker
                        label={`${i18n.t('volunteer:form.started_on.label')}`}
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
