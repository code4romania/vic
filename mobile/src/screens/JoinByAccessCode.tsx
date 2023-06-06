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
import { useTranslation } from 'react-i18next';
import useStore from '../store/store';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { useOrganization } from '../store/organization/organization.selector';

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

const JoinByAccessCode = ({ navigation }: any) => {
  const { t } = useTranslation('access_code');
  // get selected organization from state
  const { organization } = useOrganization();
  // join by access code
  const {
    data: volunteer,
    isLoading: isJoiningByAccessCode,
    mutate: joinOrganization,
  } = useJoinByAccessCodeMutation();
  // bottom sheet and active organization state
  const {
    open: openBottomSheet,
    close: closeBottomSheet,
    setActiveOrganization,
    addOrganization,
  } = useStore();
  // generated volunteerId
  console.log('JoinByAccessCode', organization?.id);

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
      organizationId: organization?.id as string,
      code: payload.code,
    };

    // make the access request
    joinOrganization(joinPayload, {
      onSuccess: (data: IVolunteer) => {
        // set this as active organization
        setActiveOrganization({
          ...data.organization,
        });

        // push new organization to my organizations drawer
        addOrganization(data.organization);

        // show modal which will eventually become bottom sheet
        openBottomSheet();
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: `${InternalErrors.ACCESS_CODE_ERRORS.getError(error.response?.data.code_error)}`,
        });
      },
    });
  };

  const onCompleteVolunteerProfile = () => {
    closeBottomSheet();
    navigation.navigate('create-volunteer', {
      volunteerId: volunteer?.id,
    });
  };

  const onCloseBottomSheet = () => {
    closeBottomSheet();
    navigation.goBack();
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
      bottomSheetOptions={{
        iconType: 'success',
        paragraph: t('modal.success.paragraph'),
        heading: t('modal.success.heading'),
        primaryAction: {
          label: t('modal.success.primary_action_label'),
          onPress: onCompleteVolunteerProfile,
        },
        secondaryAction: {
          label: t('modal.success.secondary_action_label'),
          onPress: onCloseBottomSheet,
        },
      }}
    >
      <FormLayout>
        <OrganizationIdentity name={organization?.name || ''} uri={organization?.logo || ''} />
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
