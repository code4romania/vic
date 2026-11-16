import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Sex } from '../common/enums/sex.enum';
import FormDatePicker from '../components/FormDatePicker';
import { BIRTHDAY_INITIAL_VISIBLE, BIRTHDAY_MIN, birthdayMax } from '../common/utils/birthday';
import FormSelect from '../components/FormSelect';
import { SexOptions } from '../common/constants/sex-options';
import { Linking, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUpdateUserProfileMutation } from '../services/user/user.service';
import * as ImagePicker from 'expo-image-picker';
import { ImageAttachement } from '../common/interfaces/image-attachement.interface';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import CountySelect from '../containers/CountySelect';
import CitySelect from '../containers/CitySelect';
import { Avatar, VButton } from '../components/ui';
import { spacing } from '../common/theme/tokens';
import { CONSTANTS, REGEX } from '../common/constants/constants';
import { renderPhoneNumberPrefix } from '../components/InputPrefixes';
import { normalizePhoneNumber } from '../common/utils/phone';
import { useUserProfile } from '../store/profile/profile.selector';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { useConfirmDiscard } from '../hooks/useConfirmDiscard';

export type AccountDataFormTypes = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  countyId: number;
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
  // Optional since VIC 2.0
  phone: yup
    .string()
    .transform((value) => (value ? value : undefined))
    .matches(REGEX.NUMBERS_ONLY, `${i18n.t('register:create_account.form.phone.pattern')}`)
    .length(9, `${i18n.t('register:create_account.form.phone.length', { number: 10 })}`),
  // Mandatory since VIC 2.0 (replaces the ID card data)
  birthday: yup
    .date()
    .typeError(`${i18n.t('register:create_user.form.birthday.required')}`)
    .required(`${i18n.t('register:create_user.form.birthday.required')}`),
});

const AccountData = ({ navigation }: any) => {
  // translations
  const { t } = useTranslation('account_data');
  const paddingTop = usePaddingTop();
  // user profile
  const { userProfile } = useUserProfile();
  // selected state
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<ImageAttachement | null>(
    null,
  );
  const [selectedProfilePictureUri, setSelectProfilePictureUri] = useState<string | null>(null);

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    watch,
    reset,
    getValues,
  } = useForm<AccountDataFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema as any),
  });
  useConfirmDiscard(navigation, isDirty || !!selectedProfilePicture);

  const { isLoading: isUpdatingProfile, mutate: updateUserProfile } =
    useUpdateUserProfileMutation();

  useEffect(() => {
    if (userProfile) {
      reset({
        phone: userProfile.phone?.slice(3, userProfile.phone?.length),
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        birthday: userProfile.birthday ? new Date(userProfile.birthday) : undefined,
        sex: userProfile.sex,
        countyId: userProfile.location?.county.id,
        cityId: userProfile.location?.id,
      });
    }
  }, [reset, userProfile]);

  const watchCountyId = watch('countyId');

  const onSubmit = async (payload: AccountDataFormTypes) => {
    updateUserProfile(
      {
        userProfile: {
          ...payload,
          phone: payload.phone?.trim()
            ? `${CONSTANTS.PHONE_PREFIX}${payload.phone.trim()}`
            : undefined,
        },
        profilePicture: selectedProfilePicture || undefined,
      },
      {
        onSuccess: () => {
          // Keep registered fields in the baseline; Yup can omit an empty optional phone.
          reset(getValues());
          setSelectedProfilePicture(null);
          Toast.show({ text1: `${t('submit.success')}`, type: 'success' });
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

  const onChangePicturePress = async () => {
    // The photo comes from the gallery only: no camera permission. A refusal is explained.
    const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!library.granted) {
      Toast.show({
        type: 'error',
        text1: `${t('photo_permission.title')}`,
        text2: `${t('photo_permission.description')}`,
        onPress: () => {
          Linking.openSettings().catch(() => undefined);
        },
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    handleImagePicked(result);
  };

  const handleImagePicked = async (pickerResult: ImagePicker.ImagePickerResult) => {
    if (pickerResult?.assets && pickerResult?.assets[0].uri) {
      setSelectedProfilePicture({
        name: pickerResult?.assets[0].uri.split('/').pop() as string,
        type: 'image/jpeg',
        uri: pickerResult?.assets[0].uri,
      });
      setSelectProfilePictureUri(pickerResult?.assets[0].uri);
    }
  };

  return (
    <PageLayout
      // same name as the Profil menu entry
      title={t('settings:heading')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        primaryActionLabel: t('general:save'),
        loading: isUpdatingProfile,
      }}
      headerStyle={{ paddingTop }}
    >
      <FormLayout>
        {/* 20pt side margins: the layout gives 16 */}
        <View style={styles.content}>
          <View style={styles.picture}>
            <Avatar
              name={
                `${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim() ||
                t('profile_picture')
              }
              uri={selectedProfilePictureUri || userProfile?.profilePicture}
              size={88}
            />
            <VButton
              label={t('change_profile_picture')}
              onPress={onChangePicturePress}
              variant="outline"
              size="small"
              disabled={isUpdatingProfile}
              style={styles.pictureButton}
              testID="account-data-change-picture"
            />
          </View>
          <FormInput
            control={control as any}
            name="firstName"
            error={errors.firstName}
            placeholder={t('register:create_user.form.first_name.placeholder')}
            label={t('register:create_user.form.first_name.label')}
            required={true}
            disabled={isUpdatingProfile}
          />
          <FormInput
            control={control as any}
            name="lastName"
            error={errors.lastName}
            placeholder={t('register:create_user.form.last_name.placeholder')}
            label={t('register:create_user.form.last_name.label')}
            required={true}
            disabled={isUpdatingProfile}
          />
          <FormInput
            control={control as any}
            name="email"
            error={errors.email}
            placeholder={t('register:create_account.form.email.placeholder')}
            label={t('register:create_account.form.email.label')}
            required={true}
            disabled
          />
          <FormInput
            control={control as any}
            name="phone"
            label={t('register:create_account.form.phone.label')}
            placeholder={t('register:create_account.form.phone.placeholder')}
            error={errors.phone}
            disabled={isUpdatingProfile}
            keyboardType="phone-pad"
            maxLength={10}
            normalizeText={normalizePhoneNumber}
            accessoryLeft={renderPhoneNumberPrefix}
          />
          <CountySelect
            control={control as any}
            name="countyId"
            label={t('register:create_user.form.county.label')}
            error={errors.countyId}
            placeholder={t('general:select')}
            disabled={isUpdatingProfile}
          />
          <CitySelect
            control={control as any}
            name="cityId"
            label={t('register:create_user.form.city.label')}
            error={errors.cityId}
            placeholder={t('general:select')}
            countyId={watchCountyId || (userProfile?.location?.county.id as number)}
            disabled={isUpdatingProfile}
          />
          <FormDatePicker
            control={control as any}
            name="birthday"
            label={t('register:create_user.form.birthday.label')}
            error={errors.birthday}
            placeholder={t('general:select')}
            min={BIRTHDAY_MIN}
            max={birthdayMax()}
            initialVisibleDate={BIRTHDAY_INITIAL_VISIBLE}
            disabled={isUpdatingProfile}
            required={true}
          />
          <FormSelect
            control={control as any}
            name="sex"
            label={t('general:sex', { sex_type: '' })}
            error={errors.sex}
            placeholder={t('general:select')}
            options={SexOptions}
            disabled={isUpdatingProfile}
          />
        </View>
      </FormLayout>
    </PageLayout>
  );
};

export default AccountData;

const styles = StyleSheet.create({
  content: { marginHorizontal: spacing.gutter - spacing.l, gap: spacing.l },
  picture: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
    paddingVertical: spacing.s,
  },
  // 44pt touch target (the small pill is 36)
  pictureButton: { height: 44, borderRadius: 22 },
});
