import React, { useEffect } from 'react';
import { Text } from '@ui-kitten/components';
import PageLayout from '../layouts/PageLayout';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import InlineLink from '../components/InlineLink';
import FormInput from '../components/FormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import FormDatePicker from '../components/FormDatePicker';
import { useUpdateUserPersonalDataMutation } from '../services/user/user.service';
import { useAuth } from '../hooks/useAuth';
import { IUserProfile } from '../common/interfaces/user-profile.interface';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';

export type IdentityDataFormTypes = {
  identityDocumentSeries: string;
  identityDocumentNumber: number;
  address: string;
  identityDocumentIssueDate: Date;
  identityDocumentExpirationDate: Date;
};

const schema = yup
  .object({
    identityDocumentSeries: yup
      .string()
      .matches(/^[a-zA-Z]+$/, `${i18n.t('identity_data:form.series.matches')}`)
      .required(`${i18n.t('identity_data:form.series.required')}`)
      .length(2, `${i18n.t('identity_data:form.series.length', { number: 2 })}`),
    identityDocumentNumber: yup
      .string()
      .matches(/^[0-9]+$/, `${i18n.t('identity_data:form.number.matches')}`)
      .required(`${i18n.t('identity_data:form.number.required')}`)
      .length(6, `${i18n.t('identity_data:form.number.length', { number: 6 })}`),
    address: yup
      .string()
      .required(`${i18n.t('identity_data:form.address.required')}`)
      .min(2, `${i18n.t('identity_data:form.address.min', { value: 2 })}`)
      .max(100, `${i18n.t('identity_data:form.address.max', { value: 100 })}`),
    identityDocumentIssueDate: yup
      .date()
      .required(`${i18n.t('identity_data:form.issue_date.required')}`),
    identityDocumentExpirationDate: yup
      .date()
      .required(`${i18n.t('identity_data:form.expiration_date.required')}`),
  })
  .required();

const IdentityData = ({ navigation, route }: any) => {
  const { userProfile, setUserProfile } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IdentityDataFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const { isLoading: isUpdateingPersonalData, mutate: updateUserPersonalData } =
    useUpdateUserPersonalDataMutation();

  useEffect(() => {
    const { userPersonalData } = userProfile as IUserProfile;

    // here the data can be null on first user creation
    if (userPersonalData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...formData } = userPersonalData;

      // init form data with the user profile personal data
      reset({
        ...formData,
        identityDocumentIssueDate: new Date(formData.identityDocumentIssueDate),
        identityDocumentExpirationDate: new Date(formData.identityDocumentExpirationDate),
      });
    }
  }, [userProfile, reset]);

  const onPrivacyPolicyPress = () => {
    navigation.navigate('privacy-policy');
  };

  const onSubmit = async (payload: IdentityDataFormTypes) => {
    updateUserPersonalData(
      {
        ...payload,
        identityDocumentSeries: payload.identityDocumentSeries.toLocaleUpperCase(),
      },
      {
        onSuccess: (data: IUserProfile) => {
          setUserProfile({ ...userProfile, ...data });
          // callback in case we are redirected here from any other place than settings screen
          if (route?.params?.shouldGoBack) {
            navigation.goBack();
          }
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: `${InternalErrors.USER_ERRORS.getError(error.response?.data.code_error)}`,
          });
        },
      },
    );
  };

  return (
    <PageLayout
      title={i18n.t('settings:identity')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: i18n.t('general:save'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isUpdateingPersonalData,
      }}
    >
      <FormLayout>
        <Text appearance="hint">{`${i18n.t('identity_data:description')}`}</Text>
        <InlineLink
          label={i18n.t('identity_data:privacy_policy')}
          onPress={onPrivacyPolicyPress}
          category="p2"
        />
        <FormInput
          control={control as any}
          label={i18n.t('identity_data:form.series.label')}
          name="identityDocumentSeries"
          error={errors.identityDocumentSeries}
          placeholder={i18n.t('identity_data:form.series.placeholder')}
          disabled={isUpdateingPersonalData}
        />
        <FormInput
          control={control as any}
          label={i18n.t('identity_data:form.number.label')}
          name="identityDocumentNumber"
          error={errors.identityDocumentNumber}
          placeholder={i18n.t('identity_data:form.number.placeholder')}
          keyboardType="phone-pad"
          disabled={isUpdateingPersonalData}
        />
        <FormInput
          control={control as any}
          label={i18n.t('identity_data:form.address.label')}
          name="address"
          error={errors.address}
          placeholder={i18n.t('identity_data:form.address.placeholder')}
          helper={`${i18n.t('identity_data:form.address.helper')}`}
          disabled={isUpdateingPersonalData}
        />
        <FormDatePicker
          control={control as any}
          label={i18n.t('identity_data:form.issue_date.label')}
          name="identityDocumentIssueDate"
          error={errors.identityDocumentIssueDate}
          placeholder={i18n.t('general:select')}
          min={new Date(1900, 0, 0)}
          disabled={isUpdateingPersonalData}
        />
        <FormDatePicker
          control={control as any}
          label={i18n.t('identity_data:form.expiration_date.label')}
          name="identityDocumentExpirationDate"
          error={errors.identityDocumentExpirationDate}
          placeholder={i18n.t('general:select')}
          max={new Date(2200, 0, 0)}
          disabled={isUpdateingPersonalData}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default IdentityData;
