import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import FormLayout from '../layouts/FormLayout';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Text } from '@ui-kitten/components';
import { useCreateUserProfileMutation } from '../services/user/user.service';
import { useAuth } from '../hooks/useAuth';
import { IUserProfile } from '../common/interfaces/user-profile.interface';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import { Sex } from '../common/enums/sex.enum';
import { SexOptions } from '../common/constants/sex-options';
import FormDatePicker from '../components/FormDatePicker';
import { yupResolver } from '@hookform/resolvers/yup';
import i18n from '../common/config/i18n';
import CountySelect from '../containers/CountySelect';
import CitySelect from '../containers/CitySelect';
import { Auth, Hub } from 'aws-amplify';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserFormTypes = {
  firstName: string;
  lastName: string;
  countyId: number;
  cityId: number;
  birthday: Date;
  sex: Sex;
};

const schema = yup
  .object({
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
  })
  .required();

const CreateUser = ({ navigation }: any) => {
  const { t } = useTranslation('register');
  const { mutate: createUserProfile, isLoading } = useCreateUserProfileMutation();
  const { setUserProfile } = useAuth();
  const [storageContent, setStorageContent] = useState<string>('');
  const [hubPayload, setHubPayload] = useState<string>('');

  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getAllKeys();
      setStorageContent(JSON.stringify(data));

      listenToAutoSignInEvent();
    })();
  }, []);

  const listenToAutoSignInEvent = () => {
    Hub.listen('auth', (payload: any) => {
      setHubPayload(JSON.stringify(payload));
    });
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
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
        email: user.attributes.email,
        phone: user.attributes.phone_number,
        cognitoId: user.username,
      };

      // create new profile
      createUserProfile(newUser, {
        onSuccess: (profile: IUserProfile) => {
          // update profile in context
          setUserProfile(profile);
        },
        onError: (error: any) => {
          // Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.init_profile')}` }),
          Toast.show({ type: 'error', text1: JSON.stringify(error) });
        },
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: JSON.stringify(error) });
      // Toast.show({ type: 'error', text1: `${i18n.t('auth:errors.init_profile')}` });
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
        <Text appearance="hint">{`${t('create_user.paragraph')}`}</Text>
        <Text appearance="hint">{`${storageContent}`}</Text>
        <Text appearance="hint">{`${hubPayload}`}</Text>
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
        <CountySelect
          control={control as any}
          name="countyId"
          label={t('create_user.form.county.label')}
          error={errors.countyId}
          placeholder={t('general:select')}
        />
        <CitySelect
          control={control as any}
          name="cityId"
          label={t('create_user.form.city.label')}
          error={errors.cityId}
          placeholder={t('general:select')}
          countyId={watchCountyId}
        />
        <FormDatePicker
          control={control as any}
          placeholder={t('general:select')}
          label={t('create_user.form.birthday.label')}
          min={new Date(1900, 0, 0)}
          name="birthday"
          error={errors.birthday}
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
