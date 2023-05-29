import React from 'react';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';
import { Text } from '@ui-kitten/components';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { useJoinByAccessCodeMutation } from '../services/volunteer/volunteer.service';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';

type AccessCodeFormTypes = {
  code: string;
};

const schema = yup
  .object({
    code: yup
      .string()
      .required(`${i18n.t('access_code:form.code.required')}`)
      .min(4, `${i18n.t('access_code:form.code.min', { value: 4 })}`)
      .max(
        10,
        `${i18n.t('access_code:form.code.max', {
          value: '10',
        })}`,
      ),
  })
  .required();

const JoinByAccessCode = ({ navigation, route }: any) => {
  const { organizationId, logo, name } = route.params;
  const { isLoading: isJoiningByAccessCode, mutate: joinOrganization } =
    useJoinByAccessCodeMutation();
  console.log('JonByAccessCode', organizationId);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessCodeFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (payload: AccessCodeFormTypes) => {
    // build the access request payload
    const joinPayload = {
      organizationId,
      code: payload.code,
    };

    // make the access request
    joinOrganization(joinPayload, {
      onSuccess: () => {
        // show modal which will eventually become bottom sheet
        Toast.show({
          type: 'success',
          text1: 'Requestul a fost facut cu success',
        });
        navigation.goBack();
      },
      onError: (error: any) => {
        console.log('error', error);
        Toast.show({
          type: 'error',
          text1: `${InternalErrors.ACCESS_CODE_ERRORS.getError(error.response?.data.code_error)}`,
        });
      },
    });
  };

  return (
    <PageLayout
      title={i18n.t('access_code:title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: i18n.t('general:join'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isJoiningByAccessCode,
      }}
    >
      <FormLayout>
        <OrganizationIdentity name={name} uri={logo} />
        <Text category="p2">{`${i18n.t('access_code:title')}`}</Text>
        <Text appearance="hint">{`${i18n.t('access_code:description')}`}</Text>
        <FormInput
          control={control as any}
          error={errors.code}
          label={i18n.t('access_code:title')}
          name="code"
          placeholder={i18n.t('access_code:form.code.placeholder')}
          disabled={isJoiningByAccessCode}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default JoinByAccessCode;
