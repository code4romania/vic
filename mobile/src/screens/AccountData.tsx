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
import FormSelect from '../components/FormSelect';
import { SexOptions } from '../common/constants/sex-options';
import { useAuth } from '../hooks/useAuth';
import { Platform, View } from 'react-native';
import { Image, ImageStyle } from 'react-native';
import { StyleService, Text, useStyleSheet, Button } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useUpdateUserProfileMutation } from '../services/user/user.service';
import * as ImagePicker from 'expo-image-picker';
import { ImageAttachement } from '../common/interfaces/image-attachement.interface';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import CountySelect from '../containers/CountySelect';
import CitySelect from '../containers/CitySelect';

export type AccountDataFormTypes = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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
  phone: yup.string().required(`${i18n.t('register:create_account.form.phone.required')}`),
});

const AccountData = ({ navigation }: any) => {
  const styles = useStyleSheet(themedStyles);
  // translations
  const { t } = useTranslation('account_data');
  // user profile
  const { userProfile } = useAuth();
  // selected state
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<ImageAttachement | null>(
    null,
  );
  const [selectedProfilePictureUri, setSelectProfilePictureUri] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
    reset,
  } = useForm<AccountDataFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema as any),
  });

  const { isLoading: isUpdatingProfile, mutate: updateUserProfile } =
    useUpdateUserProfileMutation();

  useEffect(() => {
    if (userProfile) {
      reset({
        phone: userProfile.phone,
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
        userProfile: payload,
        profilePicture: selectedProfilePicture || undefined,
      },
      {
        onSuccess: () => {
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
    if (Platform.OS === 'ios') {
      const cameraRollStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraRollStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      title={t('settings:heading')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        primaryActionLabel: t('general:save'),
        loading: isUpdatingProfile,
      }}
    >
      <FormLayout>
        <View style={styles.container}>
          <Text>{`${t('profile_picture')}`}</Text>
          <View style={styles.wrapper}>
            <Image
              source={{
                uri: selectedProfilePictureUri || userProfile?.profilePicture,
              }}
              style={styles.image as ImageStyle}
            />
            <Button
              onPress={onChangePicturePress}
              status="basic"
              appearance="outline"
              style={styles.button}
            >
              {() => <Text category="p2">{`${t('change_profile_picture')}`}</Text>}
            </Button>
          </View>
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
          placeholder={t('login:form.email.placeholder')}
          label={t('login:form.email.label')}
          required={true}
          disabled
        />
        <FormInput
          control={control as any}
          name="phone"
          error={errors.phone}
          placeholder={t('register:create_account:form.phone.placeholder')}
          label={t('register:create_account:form.phone.label')}
          keyboardType="phone-pad"
          required={true}
          disabled={isUpdatingProfile}
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
          countyId={watchCountyId || (userProfile?.location?.id as number)}
          disabled={isUpdatingProfile}
        />
        <FormDatePicker
          control={control as any}
          name="birthday"
          label={t('register:create_user.form.birthday.label')}
          error={errors.birthday}
          placeholder={t('general:select')}
          min={new Date(1900, 1, 1)}
          disabled={isUpdatingProfile}
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
      </FormLayout>
    </PageLayout>
  );
};

export default AccountData;

const themedStyles = StyleService.create({
  container: {
    gap: 4,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: '$cool-gray-200',
  },
  wrapper: {
    paddingVertical: 8,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
});
