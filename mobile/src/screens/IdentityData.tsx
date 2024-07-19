import React, { useEffect } from 'react';
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
import { IUserProfile } from '../common/interfaces/user-profile.interface';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';
import Paragraph from '../components/Paragraph';
import { REGEX } from '../common/constants/constants';
import { useUserProfile } from '../store/profile/profile.selector';
import { usePaddingTop } from '../hooks/usePaddingTop';

export type IdentityDataFormTypes = {
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  address: string;
  identityDocumentIssueDate: Date;
  identityDocumentExpirationDate: Date;
};

const schema = yup.object({
  identityDocumentSeries: yup
    .string()
    .matches(REGEX.STRINGS_ONLY, `${i18n.t('identity_data:form.series.matches')}`)
    .required(`${i18n.t('identity_data:form.series.required')}`)
    .length(2, `${i18n.t('identity_data:form.series.length', { number: 2 })}`),
  identityDocumentNumber: yup
    .string()
    .matches(REGEX.NUMBERS_ONLY, `${i18n.t('identity_data:form.number.matches')}`)
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
});

const IdentityData = ({ navigation, route }: any) => {
  const { userProfile } = useUserProfile();
  const { t } = useTranslation('identity_data');
  const paddingTop = usePaddingTop();

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
    Linking.openURL(`${process.env.EXPO_PUBLIC_PRIVACY_POLICY_LINK}`);
  };

  const onSubmit = async (payload: IdentityDataFormTypes) => {
    updateUserPersonalData(
      {
        ...payload,
        identityDocumentSeries: payload.identityDocumentSeries.toLocaleUpperCase(),
      },
      {
        onSuccess: () => {
          // callback in case we are redirected here from any other place than settings screen
          Toast.show({ type: 'success', text1: `${t('form.submit.success')}` });
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
      title={t('settings:identity')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('general:save'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isUpdateingPersonalData,
      }}
      headerStyle={{ paddingTop }}
    >
      <FormLayout>
        <Paragraph>{`${t('description')}`}</Paragraph>
        <InlineLink label={t('privacy_policy')} onPress={onPrivacyPolicyPress} category="p2" />
        <FormInput
          control={control as any}
          label={t('form.series.label')}
          name="identityDocumentSeries"
          error={errors.identityDocumentSeries}
          placeholder={t('form.series.placeholder')}
          disabled={isUpdateingPersonalData}
        />
        <FormInput
          control={control as any}
          label={t('form.number.label')}
          name="identityDocumentNumber"
          error={errors.identityDocumentNumber}
          placeholder={t('form.number.placeholder')}
          keyboardType="phone-pad"
          disabled={isUpdateingPersonalData}
        />
        <FormInput
          control={control as any}
          label={t('form.address.label')}
          name="address"
          error={errors.address}
          placeholder={t('form.address.placeholder')}
          helper={`${t('form.address.helper')}`}
          disabled={isUpdateingPersonalData}
        />
        <FormDatePicker
          control={control as any}
          label={t('form.issue_date.label')}
          name="identityDocumentIssueDate"
          error={errors.identityDocumentIssueDate}
          placeholder={t('general:select')}
          min={new Date(1900, 0, 0)}
          disabled={isUpdateingPersonalData}
        />
        <FormDatePicker
          control={control as any}
          label={t('form.expiration_date.label')}
          name="identityDocumentExpirationDate"
          error={errors.identityDocumentExpirationDate}
          placeholder={t('general:select')}
          max={new Date(2200, 0, 0)}
          disabled={isUpdateingPersonalData}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default IdentityData;
