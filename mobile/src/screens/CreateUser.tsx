import React from 'react';
import PageLayout from '../layouts/PageLayout';
import FormLayout from '../layouts/FormLayout';
import Paragraph from '../components/Paragraph';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Text } from '@ui-kitten/components';

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

  const {
    // control,
    // handleSubmit,
    formState: { errors },
  } = useForm<UserFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  console.log('errors', errors);

  const onSubmit = async (userPayload: UserFormTypes) => {
    console.log('userPayload', userPayload);
    // TODO: this should redirect you to the dashboard
    navigation.replace('login');
  };

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('general:continue'),
        onPrimaryActionButtonClick: onSubmit,
      }}
    >
      <FormLayout>
        <Text category="h3">{`${t('create_account.heading')}`}</Text>
        <Paragraph>{`${t('create_account.paragraph')}`}</Paragraph>
      </FormLayout>
    </PageLayout>
  );
};

export default CreateUser;
