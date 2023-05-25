import React from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Sex } from '../common/enums/sex.enum';

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
    phone: yup
      .string()
      .required(`${i18n.t('register:create_account.form.phone.required')}`)
      .max(15, `${i18n.t('register:create_account.form.phone.max', { value: 15 })}`),
  })
  .required();

const AccountData = ({ navigation }: any) => {
  const {
    control,
    formState: { errors },
  } = useForm<AccountDataFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  return (
    <PageLayout title={i18n.t('settings:heading')} onBackButtonPress={navigation.goBack}>
      <Text category="h1">Account Data</Text>
      <FormLayout>
        <FormInput
          control={control as any}
          name="firstName"
          error={errors.firstName}
          placeholder={i18n.t('create_user.form.first_name.placeholder')}
          label={i18n.t('create_user.form.first_name.label')}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default AccountData;
