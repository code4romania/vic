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
import { useTranslation } from 'react-i18next';
import useStore from '../store/store';
import Paragraph from '../components/Paragraph';

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
  const { t } = useTranslation('join_ngo');
  const { organizationId, logo, name } = route.params;
  const { isLoading: isCreatingAccessRequest, mutate: createAccessRequest } =
    useCreateAccessrequestMutation();

  const { open: openBottomSheet, close: closeBottomSheet } = useStore();
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
        openBottomSheet();
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: `${InternalErrors.ACCESS_REQUEST_ERRORS.getError(
            error.response?.data.code_error,
          )}`,
        });
      },
    });
  };

  const onSearchNewOrganizations = () => {
    closeBottomSheet();
    navigation.navigate('search');
  };

  const onCloseBottomSheet = () => {
    closeBottomSheet();
    navigation.goBack();
  };

  return (
    <PageLayout
      title={t('general:join')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: t('general:send'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isCreatingAccessRequest,
      }}
      bottomSheetOptions={{
        iconType: 'success',
        paragraph: <Paragraph>{`${t('modal.success.paragraph')}`}</Paragraph>,
        heading: t('modal.success.heading'),
        primaryAction: {
          label: t('modal.success.primary_action_label'),
          onPress: onSearchNewOrganizations,
        },
        secondaryAction: {
          label: t('modal.success.secondary_action_label'),
          onPress: onCloseBottomSheet,
        },
      }}
    >
      <FormLayout>
        <OrganizationIdentity uri={logo} name={name} />
        <Text category="p2">{`${t('registration_form')}`}</Text>
        <Text appearance="hint">{`${t('complete')}`}</Text>
        <FormSelect
          control={control as any}
          label={t('form.referral.label')}
          error={errors.referral}
          name="referral"
          options={ReferralOptions}
          placeholder={t('general:select')}
          disabled={isCreatingAccessRequest}
        />
        <FormInput
          control={control as any}
          label={t('form.motivation.label')}
          error={errors.motivation}
          name="motivation"
          multiline={true}
          textStyle={styles.textArea}
          helper={`${t('form.motivation.helper')}`}
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
