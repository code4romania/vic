import React, { useEffect, useRef, useState } from 'react';
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
import { UserPersonalDataPayload } from '../services/user/user.api';
import { findNodeHandle, ScrollView, View } from 'react-native';
import { isOver16, isOver16FromCNP } from '../common/utils/document-contracts.helpers';

export type IdentityDataFormTypes = {
  identityDocumentCNP: string;
  identityDocumentSeries: string;
  identityDocumentNumber: string;
  address: string;
  identityDocumentIssueDate: Date;
  identityDocumentIssuedBy: string;
  identityDocumentExpirationDate: Date;
  guardianName?: string;
  guardianIdentityDocumentSeries?: string;
  guardianIdentityDocumentNumber?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianCNP?: string;
  guardianAddress?: string;
};

export const mapIdentityDataFormToPayload = (
  formData: IdentityDataFormTypes,
): UserPersonalDataPayload => {
  const payload: UserPersonalDataPayload = {
    cnp: formData.identityDocumentCNP,
    identityDocumentSeries: formData.identityDocumentSeries.toUpperCase(),
    identityDocumentNumber: formData.identityDocumentNumber,
    address: formData.address,
    identityDocumentIssueDate: formData.identityDocumentIssueDate,
    identityDocumentExpirationDate: formData.identityDocumentExpirationDate,
    identityDocumentIssuedBy: formData.identityDocumentIssuedBy,
  };

  if (formData.guardianName) {
    payload.legalGuardian = {
      name: formData.guardianName,
      identityDocumentSeries: formData.guardianIdentityDocumentSeries!.toUpperCase(),
      identityDocumentNumber: formData.guardianIdentityDocumentNumber!,
      email: formData.guardianEmail!,
      phone: formData.guardianPhone!,
      cnp: formData.guardianCNP!,
      address: formData.guardianAddress!,
    };
  }

  return payload;
};

const formSchema = (isUserOver16: boolean, userBirthday: Date | undefined) =>
  yup.object({
    identityDocumentCNP: yup
      .string()
      .matches(REGEX.NUMBERS_ONLY, `${i18n.t('identity_data:form.cnp.matches')}`)
      .required(`${i18n.t('identity_data:form.cnp.required')}`)
      .length(13, `${i18n.t('identity_data:form.cnp.length', { number: 13 })}`)
      // check if the birthday extracted from the CNP matches the user birthday
      .test(
        'cnp-birthday-match',
        `${i18n.t('identity_data:form.cnp.birthday_mismatch')}`,
        (value) => {
          if (!userBirthday || !value) {
            return true;
          }
          const cnpBirthday = getBirthdayFromCNP(value);
          return cnpBirthday ? cnpBirthday.getTime() === new Date(userBirthday).getTime() : true;
        },
      ),
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
      .required(`${i18n.t('identity_data:form.issue_date.required')}`)
      .max(new Date(), `${i18n.t('identity_data:form.issue_date.future')}`),
    identityDocumentIssuedBy: yup
      .string()
      .required(`${i18n.t('identity_data:form.issued_by.required')}`),
    identityDocumentExpirationDate: yup
      .date()
      .required(`${i18n.t('identity_data:form.expiration_date.required')}`)
      .min(new Date(), `${i18n.t('identity_data:form.expiration_date.future')}`),
    guardianName: yup.string().when([], {
      is: () => !isUserOver16,
      then: (schema) => schema.required(`${i18n.t('identity_data:form.guardian.name.required')}`),
      otherwise: (schema) => schema.optional(),
    }),
    guardianCNP: yup
      .string()
      .matches(REGEX.NUMBERS_ONLY, `${i18n.t('identity_data:form.cnp.matches')}`)
      .length(13, `${i18n.t('identity_data:form.guardian.cnp.length', { number: 13 })}`)
      .when([], {
        is: () => !isUserOver16,
        then: (schema) => schema.required(`${i18n.t('identity_data:form.guardian.cnp.required')}`),
        otherwise: (schema) => schema.optional(),
      }),
    guardianAddress: yup
      .string()

      .min(2, `${i18n.t('identity_data:form.guardian.address.min', { value: 2 })}`)
      .max(100, `${i18n.t('identity_data:form.guardian.address.max', { value: 100 })}`)
      .when([], {
        is: () => !isUserOver16,
        then: (schema) =>
          schema.required(`${i18n.t('identity_data:form.guardian.address.required')}`),
        otherwise: (schema) => schema.optional(),
      }),
    guardianIdentityDocumentSeries: yup
      .string()
      .matches(REGEX.STRINGS_ONLY, `${i18n.t('identity_data:form.guardian.series.matches')}`)
      .length(2, `${i18n.t('identity_data:form.guardian.series.length', { number: 2 })}`)
      .when([], {
        is: () => !isUserOver16,
        then: (schema) =>
          schema.required(`${i18n.t('identity_data:form.guardian.series.required')}`),
        otherwise: (schema) => schema.optional(),
      }),
    guardianIdentityDocumentNumber: yup
      .string()
      .matches(REGEX.NUMBERS_ONLY, `${i18n.t('identity_data:form.guardian.number.matches')}`)
      .length(6, `${i18n.t('identity_data:form.guardian.number.length', { number: 6 })}`)
      .when([], {
        is: () => !isUserOver16,
        then: (schema) =>
          schema.required(`${i18n.t('identity_data:form.guardian.number.required')}`),
        otherwise: (schema) => schema.optional(),
      }),
    guardianEmail: yup
      .string()
      .email(`${i18n.t('identity_data:form.guardian.email.pattern')}`)
      .when([], {
        is: () => !isUserOver16,
        then: (schema) =>
          schema.required(`${i18n.t('identity_data:form.guardian.email.required')}`),
        otherwise: (schema) => schema.optional(),
      }),
    guardianPhone: yup
      .string()
      .matches(REGEX.NUMBERS_ONLY, `${i18n.t('identity_data:form.guardian.phone.matches')}`)
      .length(10, `${i18n.t('identity_data:form.guardian.phone.length', { number: 10 })}`)
      .when([], {
        is: () => !isUserOver16,
        then: (schema) =>
          schema.required(`${i18n.t('identity_data:form.guardian.phone.required')}`),
        otherwise: (schema) => schema.optional(),
      }),
  });

const getBirthdayFromCNP = (cnp: string): Date | null => {
  if (cnp.length < 7) {
    return null;
  }

  const yearPrefix = parseInt(cnp[0], 10) < 5 ? '19' : '20';
  const year = (yearPrefix + cnp.substring(1, 3)).toString();
  const month = cnp.substring(3, 5);
  const day = cnp.substring(5, 7);
  return new Date(`${year}-${month}-${day}`);
};

const IdentityData = ({ navigation, route }: any) => {
  const paddingTop = usePaddingTop();
  const { t } = useTranslation('identity_data');
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<{ [key: string]: View | null }>({});

  const { userProfile } = useUserProfile();

  // try to decide if the user is over 16 based on the birthday or the CNP
  const [isUserOver16, setIsUserOver16] = useState(
    userProfile?.birthday
      ? isOver16(userProfile?.birthday)
      : userProfile?.userPersonalData
        ? isOver16FromCNP(userProfile?.userPersonalData.cnp)
        : true,
  );

  const { isLoading: isUpdateingPersonalData, mutate: updateUserPersonalData } =
    useUpdateUserPersonalDataMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<IdentityDataFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(formSchema(isUserOver16, userProfile?.birthday)),
  });

  useEffect(() => {
    const { userPersonalData } = userProfile as IUserProfile;

    // here the data can be null on first user creation
    if (userPersonalData) {
      // init form data with the user profile personal data
      reset({
        identityDocumentCNP: userPersonalData.cnp,
        identityDocumentSeries: userPersonalData.identityDocumentSeries,
        identityDocumentNumber: userPersonalData.identityDocumentNumber,
        address: userPersonalData.address,
        identityDocumentIssueDate: new Date(userPersonalData.identityDocumentIssueDate),
        identityDocumentExpirationDate: new Date(userPersonalData.identityDocumentExpirationDate),
        identityDocumentIssuedBy: userPersonalData.identityDocumentIssuedBy,
        guardianName: userPersonalData.legalGuardian?.name,
        guardianIdentityDocumentSeries: userPersonalData.legalGuardian?.identityDocumentSeries,
        guardianIdentityDocumentNumber: userPersonalData.legalGuardian?.identityDocumentNumber,
        guardianEmail: userPersonalData.legalGuardian?.email,
        guardianPhone: userPersonalData.legalGuardian?.phone,
        guardianAddress: userPersonalData.legalGuardian?.address,
        guardianCNP: userPersonalData.legalGuardian?.cnp,
      });
    }
  }, [userProfile, reset]);

  useEffect(() => {
    // if the user has a birthday, then we don't need to check the CNP
    if (userProfile?.birthday) {
      return;
    }
    const subscription = watch((value, { name }) => {
      if (name === 'identityDocumentCNP') {
        setIsUserOver16(isOver16FromCNP(value.identityDocumentCNP || ''));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, userProfile?.birthday]);

  const registerInputRef = (name: keyof IdentityDataFormTypes) => (ref: View | null) => {
    inputRefs.current[name] = ref;
  };

  // scroll to the first input that has an error
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // check if there are any errors and get the key of the first error
      const firstErrorKey = Object.keys(errors)[0];
      const errorInput = inputRefs.current[firstErrorKey];

      if (errorInput && scrollViewRef.current) {
        const scrollViewHandle = findNodeHandle(scrollViewRef.current);
        if (scrollViewHandle) {
          errorInput.measureLayout(
            scrollViewHandle,
            (_, y) => {
              // measure the layout of the error input relative to the scroll view
              // scroll to the error input, with a 50-pixel offset for better visibility
              scrollViewRef.current?.scrollTo({ y: y - 50, animated: true });
            },
            () => console.log('measurement failed'),
          );
        }
      }
    }
  }, [errors]);

  const onPrivacyPolicyPress = () => {
    Linking.openURL(`${process.env.EXPO_PUBLIC_PRIVACY_POLICY_LINK}`);
  };

  const onSubmit = async (payload: IdentityDataFormTypes) => {
    updateUserPersonalData(mapIdentityDataFormToPayload(payload), {
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
    });
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
      androidKeyboardAvoidingViewBehavior="explicitUndefined"
    >
      <FormLayout ref={scrollViewRef}>
        <Paragraph>{`${t('description')}`}</Paragraph>
        <InlineLink label={t('privacy_policy')} onPress={onPrivacyPolicyPress} category="p2" />
        <View ref={registerInputRef('identityDocumentCNP')}>
          <FormInput
            control={control as any}
            label={t('form.cnp.label')}
            name="identityDocumentCNP"
            placeholder={t('form.cnp.placeholder')}
            error={errors.identityDocumentCNP}
            disabled={isUpdateingPersonalData}
            required={true}
          />
        </View>
        <View ref={registerInputRef('identityDocumentSeries')}>
          <FormInput
            control={control as any}
            label={t('form.series.label')}
            name="identityDocumentSeries"
            error={errors.identityDocumentSeries}
            placeholder={t('form.series.placeholder')}
            disabled={isUpdateingPersonalData}
            autoCapitalize="characters"
            required={true}
          />
        </View>
        <View ref={registerInputRef('identityDocumentNumber')}>
          <FormInput
            control={control as any}
            label={t('form.number.label')}
            name="identityDocumentNumber"
            error={errors.identityDocumentNumber}
            placeholder={t('form.number.placeholder')}
            keyboardType="phone-pad"
            disabled={isUpdateingPersonalData}
            required={true}
          />
        </View>
        <View ref={registerInputRef('address')}>
          <FormInput
            control={control as any}
            label={t('form.address.label')}
            name="address"
            error={errors.address}
            placeholder={t('form.address.placeholder')}
            helper={`${t('form.address.helper')}`}
            disabled={isUpdateingPersonalData}
            required={true}
          />
        </View>
        <View ref={registerInputRef('identityDocumentIssueDate')}>
          <FormDatePicker
            control={control as any}
            label={t('form.issue_date.label')}
            name="identityDocumentIssueDate"
            error={errors.identityDocumentIssueDate}
            placeholder={t('general:select')}
            min={new Date(1900, 0, 0)}
            disabled={isUpdateingPersonalData}
            max={new Date()}
            required={true}
          />
        </View>
        <View ref={registerInputRef('identityDocumentExpirationDate')}>
          <FormDatePicker
            control={control as any}
            label={t('form.expiration_date.label')}
            name="identityDocumentExpirationDate"
            error={errors.identityDocumentExpirationDate}
            placeholder={t('general:select')}
            max={new Date(2200, 0, 0)}
            disabled={isUpdateingPersonalData}
            min={new Date()}
            required={true}
          />
        </View>
        <View ref={registerInputRef('identityDocumentIssuedBy')}>
          <FormInput
            control={control as any}
            label={t('form.issued_by.label')}
            name="identityDocumentIssuedBy"
            error={errors.identityDocumentIssuedBy}
            placeholder={t('form.issued_by.placeholder')}
            disabled={isUpdateingPersonalData}
            required={true}
          />
        </View>
        {!isUserOver16 && (
          <>
            <Paragraph>{`${t('legal_gardian_data_required')}`}</Paragraph>
            <View ref={registerInputRef('guardianName')}>
              <FormInput
                control={control as any}
                label={t('form.guardian.name.label')}
                name="guardianName"
                error={errors.guardianName}
                placeholder={t('form.guardian.name.placeholder')}
                disabled={isUpdateingPersonalData}
                required={true}
              />
            </View>
            <View ref={registerInputRef('guardianEmail')}>
              <FormInput
                control={control as any}
                label={t('form.guardian.email.label')}
                name="guardianEmail"
                error={errors.guardianEmail}
                placeholder={t('form.guardian.email.placeholder')}
                disabled={isUpdateingPersonalData}
                required={true}
              />
            </View>
            <View ref={registerInputRef('guardianPhone')}>
              <FormInput
                control={control as any}
                label={t('form.guardian.phone.label')}
                name="guardianPhone"
                error={errors.guardianPhone}
                placeholder={t('form.guardian.phone.placeholder')}
                disabled={isUpdateingPersonalData}
                required={true}
              />
            </View>
            <View ref={registerInputRef('guardianAddress')}>
              <FormInput
                control={control as any}
                label={t('form.guardian.address.label')}
                name="guardianAddress"
                error={errors.guardianAddress}
                placeholder={t('form.guardian.address.placeholder')}
                disabled={isUpdateingPersonalData}
                required={true}
              />
            </View>
            <View ref={registerInputRef('guardianCNP')}>
              <FormInput
                control={control as any}
                label={t('form.guardian.cnp.label')}
                name="guardianCNP"
                error={errors.guardianCNP}
                placeholder={t('form.guardian.cnp.placeholder')}
                disabled={isUpdateingPersonalData}
                required={true}
              />
            </View>
            <View ref={registerInputRef('guardianIdentityDocumentSeries')}>
              <FormInput
                control={control as any}
                label={t('form.guardian.series.label')}
                name="guardianIdentityDocumentSeries"
                error={errors.guardianIdentityDocumentSeries}
                placeholder={t('form.guardian.series.placeholder')}
                disabled={isUpdateingPersonalData}
                autoCapitalize="characters"
                required={true}
              />
            </View>
            <View ref={registerInputRef('guardianIdentityDocumentNumber')}>
              <FormInput
                control={control as any}
                label={t('form.guardian.number.label')}
                name="guardianIdentityDocumentNumber"
                error={errors.guardianIdentityDocumentNumber}
                placeholder={t('form.guardian.number.placeholder')}
                keyboardType="phone-pad"
                disabled={isUpdateingPersonalData}
                required={true}
              />
            </View>
          </>
        )}
      </FormLayout>
    </PageLayout>
  );
};

export default IdentityData;
