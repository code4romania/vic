import React from 'react';
import PageLayout from '../layouts/PageLayout';
import FormLayout from '../layouts/FormLayout';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Text } from '@ui-kitten/components';
import { useCreateUserProfileMutation } from '../services/user/user.service';

export type UserFormTypes = {
  firstName: string;
  lastName: string;
  city: string;
  county: string;
  birthday: Date;
  sex: string; // TODO: make this enum
};

const CreateUser = ({ navigation }: any) => {
  const { t } = useTranslation('register');
  const { mutate: createUserProfile, isLoading } = useCreateUserProfileMutation();

  const {
    // control,
    // handleSubmit,
    // formState: { errors },
  } = useForm<UserFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (userPayload: UserFormTypes) => {
    // TODO: this should redirect you to the dashboard
    createUserProfile(userPayload, {
      onSuccess: () => navigation.replace('login'),
      onError: (error) => console.log('error', error),
    });
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('general:continue'),
        onPrimaryActionButtonClick: onSubmit,
        loading: isLoading,
      }}
    >
      <FormLayout>
        <Text category="h3">{`${t('create_account.heading')}`}</Text>
        <Text appearance="hint">{`${t('create_account.paragraph')}`}</Text>
      </FormLayout>
    </PageLayout>
  );
};

export default CreateUser;
