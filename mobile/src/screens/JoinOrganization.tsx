import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import * as yup from 'yup';
import OrganizationIdentity from '../components/OrganizationIdentity';
import FormLayout from '../layouts/FormLayout';
import FormSelect from '../components/FormSelect';
import { REFERRAL } from '../common/enums/refferal.enum';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReferralOptions } from '../common/constants/referral-options';
import FormInput from '../components/FormInput';
import { StyleSheet } from 'react-native';
import { useCreateAccessrequestMutation } from '../services/access-request/access-request.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import Toast from 'react-native-toast-message';

export type JoinNgoFormTypes = {
  referral: REFERRAL;
  motivation: string;
};

const schema = yup
  .object({
    referral: yup.string().required(`${i18n.t('join_ngo:form.referral.required')}`),
    motivation: yup
      .string()
      .required(`${i18n.t('join_ngo:form.motivation.required')}`)
      .min(2, `${i18n.t('join_ngo:form.motivation.min', { value: 2 })}`)
      .max(50, `${i18n.t('join_ngo:form.motivation.max', { value: 50 })}`),
  })
  .required();

const JoinOrganization = ({ navigation, route }: any) => {
  const { organizationId, logo, name } = route.params;
  const { isLoading: isCreatingAccessRequest, mutate: createAccessRequest } =
    useCreateAccessrequestMutation();
  console.log('JoinOrganization', organizationId);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinNgoFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (payload: JoinNgoFormTypes) => {
    // build the access request payload
    const accessRequestPayload = {
      organizationId,
      answers: [
        { question: 'referral', answer: payload.referral },
        { question: 'motivation', answer: payload.motivation },
      ],
    };

    // make the access request
    createAccessRequest(accessRequestPayload, {
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
          text1: `${InternalErrors.ACCESS_REQUEST_ERRORS.getError(
            error.response?.data.code_error,
          )}`,
        });
      },
    });
  };

  return (
    <PageLayout
      title={i18n.t('general:join')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: i18n.t('general:send'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isCreatingAccessRequest,
      }}
    >
      <FormLayout>
        <OrganizationIdentity uri={logo} name={name} />
        <Text category="p2">{`${i18n.t('join_ngo:registration_form')}`}</Text>
        <Text appearance="hint">{`${i18n.t('join_ngo:complete')}`}</Text>
        <FormSelect
          control={control as any}
          label={i18n.t('join_ngo:form.referral.label')}
          error={errors.referral}
          name="referral"
          options={ReferralOptions}
          placeholder={i18n.t('general:select')}
          disabled={isCreatingAccessRequest}
        />
        <FormInput
          control={control as any}
          label={i18n.t('join_ngo:form.motivation.label')}
          error={errors.motivation}
          name="motivation"
          multiline={true}
          textStyle={styles.textArea}
          helper={`${i18n.t('join_ngo:form.motivation.helper')}`}
          placeholder=""
          disabled={isCreatingAccessRequest}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default JoinOrganization;

const styles = StyleSheet.create({
  textArea: {
    minHeight: 52,
  },
});
