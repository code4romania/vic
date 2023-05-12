import React from 'react';
import PageLayout from '../layouts/PageLayout';
import FormLayout from '../layouts/FormLayout';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Text } from '@ui-kitten/components';
import { useCreateUserProfileMutation } from '../services/user/user.service';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import { Sex } from '../common/enums/sex.enum';
import { SexOptions } from '../common/constants/sex-options';
import FormDatePicker from '../components/FormDatePicker';

export type UserFormTypes = {
  firstName: string;
  lastName: string;
  city: string;
  county: string;
  birthDate: Date;
  sex: Sex;
};

const CreateUser = ({ navigation }: any) => {
  const { t } = useTranslation('register');
  const { mutate: createUserProfile, isLoading } = useCreateUserProfileMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (userPayload: UserFormTypes) => {
    console.log(
      userPayload.firstName,
      userPayload.lastName,
      userPayload.birthDate,
      userPayload.sex,
    );
    // TODO: this should redirect you to the dashboard
    // createUserProfile(userPayload, {
    //   onSuccess: () => navigation.replace('login'),
    //   onError: (error) => console.log('error', error),
    // });
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
        <Text appearance="hint">{`${t('create_user.paragraph')}`}</Text>
        <FormInput
          control={control as any}
          placeholder={t('create_user.form.first_name.placeholder')}
          label={t('create_user.form.first_name.label')}
          name="firstName"
          error={errors.firstName}
          required={true}
        />
        <FormInput
          control={control as any}
          placeholder={t('create_user.form.last_name.placeholder')}
          label={t('create_user.form.last_name.label')}
          name="lastName"
          error={errors.lastName}
          required={true}
        />
        <FormDatePicker
          control={control as any}
          placeholder={t('general:select')}
          label={t('create_user.form.birth_date.label')}
          min={new Date(1900, 0, 0)}
          name="birthDate"
          error={errors.birthDate}
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

export default CreateUser;
