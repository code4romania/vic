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
import { SvgXml } from 'react-native-svg';
import infoSVG from '../assets/svg/info';
import { StyleSheet } from 'react-native';

const organization = {
  name: 'Asociația ZEN',
  uri: 'https://picsum.photos/200/300',
};

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

const AccessCode = ({ navigation }: any) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessCodeFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (payload: any) => {
    console.log(payload.code);
  };

  const renderIcon = (error: any) => {
    return error ? () => <SvgXml xml={infoSVG} style={styles.icon} /> : undefined;
  };

  return (
    <PageLayout
      title={i18n.t('access_code:title')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        primaryActionLabel: i18n.t('general:join'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
      }}
    >
      <FormLayout>
        <OrganizationIdentity name={organization.name} uri={organization.uri} />
        <Text category="p2">{`${i18n.t('access_code:title')}`}</Text>
        <Text appearance="hint">{`${i18n.t('access_code:description')}`}</Text>
        <FormInput
          control={control as any}
          error={errors.code}
          label={i18n.t('access_code:title')}
          name="code"
          placeholder={i18n.t('access_code:form.code.placeholder')}
          accessoryRight={renderIcon(errors?.code)}
        />
      </FormLayout>
    </PageLayout>
  );
};

export default AccessCode;

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
  },
});
