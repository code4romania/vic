import React, { useRef } from 'react';
import PageLayout from '../layouts/PageLayout';
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
import { StyleSheet, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Sheet, VButton, VText } from '../components/ui';
import { EventIcon } from '../components/events/EventIcons';
import InlineLink from '../components/InlineLink';
import { colors, spacing } from '../common/theme/tokens';
import { usePaddingTop } from '../hooks/usePaddingTop';

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

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const leavingTo = useRef<'back' | 'search'>('back');
  const paddingTop = usePaddingTop();

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
    resolver: yupResolver(schema) as any,
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
        bottomSheetRef.current?.present();
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

  // closing the sheet (button, swipe, Back) leaves the form: the request is sent
  const onSearchNewOrganizations = () => {
    leavingTo.current = 'search';
    bottomSheetRef.current?.dismiss();
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
        headerStyle={{ paddingTop }}
      >
        <FormLayout>
          <View style={styles.content}>
            <OrganizationIdentity uri={logo} name={name} card />
            <VText variant="sub">{`${t('complete')}`}</VText>
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
          </View>
        </FormLayout>
      </PageLayout>
      {/* sized to its content: the text is never cut on a small screen */}
      <Sheet
        ref={bottomSheetRef}
        onDismiss={() => {
          if (leavingTo.current === 'search') {
            navigation.navigate('search');
          } else {
            navigation.goBack();
          }
        }}
        testID="join-success-sheet"
      >
        <View style={styles.checkIcon}>
          <EventIcon name="check" size={30} color={colors.status.ok.fg} strokeWidth={2.6} />
        </View>
        <View style={styles.sheetText}>
          <VText variant="largeTitle" style={styles.sheetTitle} accessibilityRole="header">
            {`${t('modal.success.heading')}`}
          </VText>
          <VText variant="sub">{`${t('modal.success.paragraph')}`}</VText>
        </View>
        <VButton
          label={t('modal.success.primary_action_label')}
          onPress={onSearchNewOrganizations}
        />
        <View style={styles.link}>
          <InlineLink
            label={t('modal.success.secondary_action_label')}
            onPress={() => bottomSheetRef.current?.dismiss()}
          />
        </View>
      </Sheet>
    </>
  );
};

export default JoinOrganization;

const styles = StyleSheet.create({
  // FormLayout's content sits at 16: 4 more align it with the 20pt gutter of the page title
  content: { gap: spacing.l, paddingHorizontal: spacing.gutter - spacing.l },
  checkIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.status.ok.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.m,
  },
  sheetText: { gap: 6 },
  sheetTitle: { fontSize: 26 },
  link: { alignItems: 'center' },
});
