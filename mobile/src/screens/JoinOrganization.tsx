import React, { useMemo, useRef } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text, useTheme } from '@ui-kitten/components';
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
import { useCreateAccessrequestMutation } from '../services/access-request/access-request.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import successIcon from '../assets/svg/success-icon';
import Paragraph from '../components/Paragraph';
import BottomSheet from '@gorhom/bottom-sheet';
import { renderBackdrop } from '../components/BottomSheet';
import { StyleSheet, View } from 'react-native';
import Button from '../components/Button';
import InlineLink from '../components/InlineLink';
import { SvgXml } from 'react-native-svg';

export type JoinNgoFormTypes = {
  referral: REFERRAL;
  motivation: string;
};

const schema = yup.object({
  referral: yup.string().required(`${i18n.t('join_ngo:form.referral.required')}`),
  motivation: yup
    .string()
    .required(`${i18n.t('join_ngo:form.motivation.required')}`)
    .min(2, `${i18n.t('join_ngo:form.motivation.min', { value: 2 })}`)
    .max(50, `${i18n.t('join_ngo:form.motivation.max', { value: 50 })}`),
});

const JoinOrganization = ({ navigation, route }: any) => {
  const { t } = useTranslation('join_ngo');

  // bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  // bottom sheet snap points
  const snapPoints = useMemo(() => ['30%', '55%'], []);
  // theme
  const theme = useTheme();

  const { organizationId, logo, name } = route.params;
  const { isLoading: isCreatingAccessRequest, mutate: createAccessRequest } =
    useCreateAccessrequestMutation();

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
        bottomSheetRef.current?.expand();
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
    navigation.navigate('search');
    bottomSheetRef.current?.close();
  };

  const onCloseBottomSheet = () => {
    navigation.goBack();
    bottomSheetRef.current?.close();
  };

  return (
    <>
      <PageLayout
        title={t('general:join')}
        onBackButtonPress={navigation.goBack}
        actionsOptions={{
          primaryActionLabel: t('general:send'),
          onPrimaryActionButtonClick: handleSubmit(onSubmit),
          loading: isCreatingAccessRequest,
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
            helper={`${t('form.motivation.helper')}`}
            placeholder=""
            disabled={isCreatingAccessRequest}
          />
        </FormLayout>
      </PageLayout>
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.svgContainer}>
            <SvgXml xml={successIcon} height={110} width={110} />
          </View>
          <View style={styles.textContainer}>
            <Text category="h1">{`${t('modal.success.heading')}`}</Text>
            <Paragraph>{`${t('modal.success.paragraph')}`}</Paragraph>
          </View>
          <View style={styles.buttonsContainer}>
            <Button
              label={t('modal.success.primary_action_label')}
              onPress={onSearchNewOrganizations}
            />
            <InlineLink
              style={{ color: theme['cool-gray-700'] }}
              label={t('modal.success.secondary_action_label')}
              onPress={onCloseBottomSheet}
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

export default JoinOrganization;

const styles = StyleSheet.create({
  bottomSheetContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 40,
    paddingVertical: 8,
    gap: 24,
  },
  svgContainer: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomSheetParagraph: {
    textAlign: 'center',
  },
  buttonsContainer: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
