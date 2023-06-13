import React from 'react';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Sex } from '../common/enums/sex.enum';
import CountySelect from '../containers/CountySelect';
import CitySelect from '../containers/CitySelect';
import FormDatePicker from '../components/FormDatePicker';
import FormSelect from '../components/FormSelect';
import { SexOptions } from '../common/constants/sex-options';
import VolunteerPictureSection from '../components/VolunteerPictureSection';
import { useTranslation } from 'react-i18next';

type AccountDataFormTypes = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countyId: number;
  cityId: number;
  birthday: Date;
  sex: Sex;
};

const schema = yup
  .object({
    firstName: yup
      .string()
      .required(`${i18n.t('register:create_user.form.first_name.required')}`)
      .min(2, `${i18n.t('register:create_user.form.first_name.min', { value: '2' })}`)
      .max(
        50,
        `${i18n.t('register:create_user.form.first_name.max', {
          value: '50',
        })}`,
      ),
    lastName: yup
      .string()
      .required(`${i18n.t('register:create_user.form.last_name.required')}`)
      .min(2, `${i18n.t('register:create_user.form.last_name.min', { value: '2' })}`)
      .max(
        50,
        `${i18n.t('register:create_user.form.last_name.max', {
          value: '50',
        })}`,
      ),
    email: yup
      .string()
      .email(`${i18n.t('login:form.email.pattern')}`)
      .required(`${i18n.t('login:form.email.required')}`)
      .min(2, `${i18n.t('login:form.email.min', { value: '2' })}`)
      .max(
        50,
        `${i18n.t('login:form.email.max', {
          value: '50',
        })}`,
      ),
    phone: yup
      .string()
      .required(`${i18n.t('register:create_account.form.phone.required')}`)
      .max(15, `${i18n.t('register:create_account.form.phone.max', { value: 15 })}`),
    countyId: yup.string().required(`${i18n.t('register:create_user.form.county.required')}`),
    cityId: yup.string().required(`${i18n.t('register:create_user.form.city.required')}`),
    birthday: yup.string().required(`${i18n.t('register:create_user.form.birthday.required')}`),
    sex: yup.string().required(`${i18n.t('register:create_user.form.sex.required')}`),
  })
  .required();

const AccountData = ({ navigation }: any) => {
  const { t } = useTranslation('register');

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<AccountDataFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const watchCountyId = watch('countyId');

  const onSubmit = (payload: AccountDataFormTypes) => {
    console.log(payload);
  };

  return (
    <PageLayout
      title={t('settings:heading')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        primaryActionLabel: t('general:save'),
      }}
    >
      <FormLayout>
        <VolunteerPictureSection />
        <FormInput
          control={control as any}
          name="firstName"
          error={errors.firstName}
          placeholder={t('create_user.form.first_name.placeholder')}
          label={t('create_user.form.first_name.label')}
          required={true}
        />
        <FormInput
          control={control as any}
          name="lastName"
          error={errors.lastName}
          placeholder={t('create_user.form.last_name.placeholder')}
          label={t('create_user.form.last_name.label')}
          required={true}
        />
        <FormInput
          control={control as any}
          name="email"
          error={errors.email}
          placeholder={t('login:form.email.placeholder')}
          label={t('login:form.email.label')}
          required={true}
        />
        <FormInput
          control={control as any}
          name="phone"
          error={errors.phone}
          placeholder={t('create_account.form.phone.placeholder')}
          label={t('create_account.form.phone.label')}
          keyboardType="phone-pad"
          required={true}
        />
        <CountySelect
          control={control as any}
          name="countyId"
          label={t('create_user.form.county.label')}
          error={errors.countyId}
          placeholder={t('general:select')}
        />
        <CitySelect
          control={control as any}
          name="cityId"
          label={t('create_user.form.city.label')}
          error={errors.cityId}
          placeholder={t('general:select')}
          countyId={watchCountyId}
        />
        <FormDatePicker
          control={control as any}
          name="birthday"
          label={t('create_user.form.birthday.label')}
          error={errors.birthday}
          placeholder={t('general:select')}
          min={new Date(1900, 1, 1)}
        />
        <FormSelect
          control={control as any}
          name="sex"
          label={t('general:sex', { sex_type: '' })}
          error={errors.sex}
          placeholder={t('general:select')}
          options={SexOptions}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default AccountData;
