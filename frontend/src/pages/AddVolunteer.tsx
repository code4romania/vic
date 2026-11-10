import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import FormDatePicker from '../components/FormDatePicker';
import FormInput from '../components/FormInput';
import FormTextarea from '../components/FormTextarea';
import PageHeader from '../components/PageHeader';
import Paragraph from '../components/Paragraph';
import RadioGroup from '../components/RadioGroup';
import { SelectItem } from '../components/Select';
import LoadingContent from '../components/LoadingContent';
import Card from '../layouts/CardLayout';
import FormLayout from '../layouts/FormLayout';
import PageLayout from '../layouts/PageLayout';
import LocationSelect from '../containers/LocationSelect';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { DivisionType } from '../common/enums/division-type.enum';
import { ListItem } from '../common/interfaces/list-item.interface';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useAddVolunteerMutation } from '../services/volunteer/volunteer.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { useValidationGate } from '../hooks/useValidationGate';

export type AddVolunteerFormTypes = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthday?: Date | null;
  city?: ListItem;
  department?: SelectItem<string>;
  notes?: string;
  status: VolunteerStatus.CANDIDATE | VolunteerStatus.ACTIVE;
};

const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(`volunteers:add.${key}`, options) as string;

const name = () =>
  yup
    .string()
    .trim()
    .required(t('required'))
    .min(2, t('min', { value: 2 }))
    .max(50, t('max', { value: 50 }));

// The same rules as backend AddVolunteerDto.
const schema = yup.object({
  firstName: name(),
  lastName: name(),
  email: yup.string().trim().required(t('required')).email(t('email_invalid')),
  phone: yup
    .string()
    .trim()
    .max(20, t('max', { value: 20 })),
  birthday: yup
    .date()
    .nullable()
    .optional()
    .typeError(t('invalid_date'))
    .max(new Date(), t('birthday_future')),
  notes: yup
    .string()
    .trim()
    .max(1000, t('max', { value: 1000 })),
  status: yup
    .mixed<VolunteerStatus.CANDIDATE | VolunteerStatus.ACTIVE>()
    .oneOf([VolunteerStatus.CANDIDATE, VolunteerStatus.ACTIVE])
    .required(t('required')),
});

// #471: one form for adding a volunteer. Active sends the invitation email; Candidate sends nothing and
// the person has no account until they sign up in the app with this email.
const AddVolunteer = () => {
  const navigate = useNavigate();
  const { blocked, gate } = useValidationGate();
  const { mutate: addVolunteer, isLoading } = useAddVolunteerMutation();

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<AddVolunteerFormTypes>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: '',
      birthday: null,
      status: VolunteerStatus.CANDIDATE,
    },
    resolver: yupResolver(schema) as never,
  });

  const onBack = () => navigate('/volunteers', { replace: true });

  const onSubmit = (data: AddVolunteerFormTypes) => {
    addVolunteer(data, {
      onSuccess: (volunteer) => {
        useSuccessToast(
          t(data.status === VolunteerStatus.ACTIVE ? 'success_active' : 'success_candidate', {
            name: `${data.firstName.trim()} ${data.lastName.trim()}`,
          }),
        );
        navigate(`/volunteers/${volunteer.id}`, { replace: true });
      },
      onError: (error) => {
        useErrorToast(InternalErrors.VOLUNTEER_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  const textField = (
    field: 'firstName' | 'lastName' | 'email' | 'phone',
    type = 'text',
    autoComplete?: string,
  ) => (
    <Controller
      name={field}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <FormInput
          type={type}
          autoComplete={autoComplete}
          label={t(field)}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          errorMessage={errors[field]?.message}
        />
      )}
    />
  );

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onBack}>{t('title')}</PageHeader>
      {isLoading && <LoadingContent />}
      <Card>
        <CardHeader>
          <h2>{t('card_title')}</h2>
          <Button
            label={t('submit')}
            className="btn-primary shrink-0"
            icon={<CloudArrowUpIcon className="h-5 w-5 md:hidden" />}
            onClick={handleSubmit(onSubmit)}
            {...gate}
            disabled={isLoading || blocked}
          />
        </CardHeader>
        <CardBody>
          <FormLayout>
            <form
              className="max-w-[30rem] relative left-1/2 -translate-x-1/2 flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <Paragraph title={t('title')}>{t('description')}</Paragraph>
              {textField('firstName', 'text', 'given-name')}
              {textField('lastName', 'text', 'family-name')}
              {textField('email', 'email', 'email')}
              {textField('phone', 'tel', 'tel')}
              <Controller
                name="birthday"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FormDatePicker
                    label={t('birthday')}
                    value={value}
                    onChange={onChange}
                    errorMessage={errors.birthday?.message}
                  />
                )}
              />
              <Controller
                name="city"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <LocationSelect label={t('city')} value={value} onSelect={onChange} />
                )}
              />
              <Controller
                name="department"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <OrganizationStructureSelect
                    label={t('department')}
                    placeholder={`${i18n.t('general:select', { item: '' })}`}
                    onChange={onChange}
                    selected={value}
                    type={DivisionType.DEPARTMENT}
                  />
                )}
              />
              <Controller
                name="notes"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormTextarea
                    label={t('notes')}
                    helper={<p className="text-cool-gray-500">{t('notes_helper')}</p>}
                    value={value ?? ''}
                    onChange={onChange}
                    onBlur={onBlur}
                    errorMessage={errors.notes?.message}
                  />
                )}
              />
              <Controller
                name="status"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <RadioGroup
                    name="status"
                    label={t('status')}
                    options={[
                      { key: VolunteerStatus.CANDIDATE, value: t('status_candidate') },
                      { key: VolunteerStatus.ACTIVE, value: t('status_active') },
                    ]}
                    defaultValue={value}
                    onChange={onChange}
                  />
                )}
              />
            </form>
          </FormLayout>
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default AddVolunteer;
