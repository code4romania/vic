import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Icon } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useForm } from 'react-hook-form';
import { TouchableWithoutFeedback } from 'react-native';
import Paragraph from '../components/Paragraph';

const emailRules = {
  required: 'Email is required',
  minLength: {
    value: 2,
    message: 'Email must be at least 2 characters',
  },
  maxLength: {
    value: 50,
    message: 'Email must not exceed 50 characters',
  },
};

const Login = ({ navigation }: any) => {
  const { login } = useAuth();
  const { t } = useTranslation('page_headers');
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (credentials: any) => {
    console.log('credentials', credentials);
    login(credentials);
  };

  const renderPasswordEyeIcon = (props: any): React.ReactElement => (
    <TouchableWithoutFeedback onPress={setSecureTextEntry.bind(null, !secureTextEntry)}>
      <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  return (
    <PageLayout
      title={t('login')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: 'Intra in cont',
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
      }}
    >
      <FormLayout>
        <Paragraph>{`${t('login:paragraph')}`}</Paragraph>
        <FormInput
          control={control}
          name="email"
          label="Email"
          placeholder="Enter your email"
          rules={emailRules}
          error={errors.email}
        />
        <FormInput
          control={control}
          name="password"
          label="Password"
          placeholder="Enter your password"
          rules={{}}
          secureTextEntry={secureTextEntry}
          error={errors.password}
          accessoryRight={renderPasswordEyeIcon}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default Login;
