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

export type JoinNgoFormTypes = {
  referral: REFERRAL;
  motivation: string;
};

const organization = {
  name: 'Asociația ZEN',
  logo: 'https://picsum.photos/200/300',
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

const JoinOrganization = ({ navigation }: any) => {
  console.log('JoinOrganization');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (payload: any) => {
    console.log(payload.referral, payload.motivation);
  };

  return (
    <PageLayout
      title={i18n.t('general:join')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: i18n.t('general:send'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
      }}
    >
      <FormLayout>
        <OrganizationIdentity uri={organization.logo} name={organization.name} />
        <Text category="p2">{`${i18n.t('join_ngo:registration_form')}`}</Text>
        <Text appearance="hint">{`${i18n.t('join_ngo:complete')}`}</Text>
        <FormSelect
          control={control}
          label={i18n.t('join_ngo:form.referral.label')}
          error={errors.referral}
          name="referral"
          options={ReferralOptions}
          placeholder={i18n.t('general:select')}
        />
        <FormInput
          control={control}
          label={i18n.t('join_ngo:form.motivation.label')}
          error={errors.motivation}
          name="motivation"
          multiline={true}
          textStyle={styles.textArea}
          helper={`${i18n.t('join_ngo:form.motivation.helper')}`}
          placeholder=""
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
