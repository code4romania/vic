import React from 'react';
import PageLayout from '../layouts/PageLayout';
import FormLayout from '../layouts/FormLayout';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Text } from '@ui-kitten/components';
import { useCreateUserProfileMutation } from '../services/user/user.service';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import { Sex } from '../common/enums/sex.enum';
import { SexOptions } from '../common/constants/sex-options';
import FormDatePicker from '../components/FormDatePicker';
import { yupResolver } from '@hookform/resolvers/yup';
import i18n from '../common/config/i18n';
import CountySelect from '../containers/CountySelect';
import CitySelect from '../containers/CitySelect';
import { Auth } from 'aws-amplify';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import Paragraph from '../components/Paragraph';
import { InternalErrors } from '../common/errors/internal-errors.class';

export type UserFormTypes = {
  firstName: string;
  lastName: string;
  countyId: number;
  phone: string;
  cityId: number;
  birthday: Date;
  sex: Sex;
};

const schema = yup.object({
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
});

const CreateUser = ({ navigation }: any) => {
  const { t } = useTranslation('register');
  const { mutate: createUserProfile, isLoading } = useCreateUserProfileMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema as any),
  });

  const watchCountyId = watch('countyId');

  const onSubmit = async ({ cityId, ...userPayload }: UserFormTypes) => {
    try {
      // get user phone and email data from aws
      const user = await Auth.currentAuthenticatedUser({ bypassCache: true });

      // create new user payload
      const newUser = {
        ...userPayload,
        locationId: cityId,
        phone: user.attributes.phone_number,
        email: user.attributes.email,
        cognitoId: user.username,
      };

      // create new profile
      createUserProfile(newUser, {
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: `${InternalErrors.USER_ERRORS.getError(error.response?.data.code_error)}`,
          });
        },
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: `${t('auth:errors.init_profile')}` });
    }
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('general:continue'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isLoading,
      }}
    >
      <FormLayout>
        <Text category="h3">{`${t('create_user.heading')}`}</Text>
        <Paragraph>{`${t('create_user.paragraph')}`}</Paragraph>
        <FormInput
          control={control as any}
          placeholder={t('create_user.form.first_name.placeholder')}
          label={t('create_user.form.first_name.label')}
          name="firstName"
          disabled={isLoading}
          error={errors.firstName}
          required={true}
        />
        <FormInput
          control={control as any}
          placeholder={t('create_user.form.last_name.placeholder')}
          label={t('create_user.form.last_name.label')}
          name="lastName"
          error={errors.lastName}
          disabled={isLoading}
          required={true}
        />
        <CountySelect
          control={control as any}
          name="countyId"
          label={t('create_user.form.county.label')}
          error={errors.countyId}
          disabled={isLoading}
          placeholder={t('general:select')}
        />
        <CitySelect
          control={control as any}
          name="cityId"
          label={t('create_user.form.city.label')}
          error={errors.cityId}
          disabled={isLoading}
          placeholder={t('general:select')}
          countyId={watchCountyId}
        />
        <FormDatePicker
          control={control as any}
          placeholder={t('general:select')}
          label={t('create_user.form.birthday.label')}
          min={new Date(1900, 0, 0)}
          disabled={isLoading}
          name="birthday"
          error={errors.birthday}
        />
        <FormSelect
          control={control as any}
          name="sex"
          label={t('general:sex', { sex_type: '' })}
          error={errors.sex}
          disabled={isLoading}
          placeholder={t('general:select')}
          options={SexOptions}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default CreateUser;
