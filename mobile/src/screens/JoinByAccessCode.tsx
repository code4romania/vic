import React, { useRef } from 'react';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';
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
import { useOrganization } from '../store/organization/organization.selector';
import { StyleSheet, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Sheet, VButton, VText } from '../components/ui';
import { EventIcon } from '../components/events/EventIcons';
import InlineLink from '../components/InlineLink';
import { colors, spacing } from '../common/theme/tokens';
import { usePaddingTop } from '../hooks/usePaddingTop';

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
  const paddingTop = usePaddingTop();

  // get selected organization from state
  const { organization } = useOrganization();
  // join by access code
  const {
    data: volunteer,
    isLoading: isJoiningByAccessCode,
    mutate: joinOrganization,
  } = useJoinByAccessCodeMutation();

  const successRef = useRef<BottomSheetModal>(null);
  // the user already joined: closing the sheet (button, swipe, Back) leaves the form
  const leavingTo = useRef<'back' | 'profile'>('back');

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
      onSuccess: () => {
        successRef.current?.present();
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
    leavingTo.current = 'profile';
    successRef.current?.dismiss();
  };

  const onSuccessDismiss = () => {
    if (leavingTo.current === 'profile') {
      leavingTo.current = 'back';
      navigation.navigate('create-volunteer', {
        volunteerId: volunteer?.id,
      });
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <PageLayout
        title={t('title')}
        onBackButtonPress={navigation.goBack}
        actionsOptions={{
          primaryActionLabel: t('general:join'),
          onPrimaryActionButtonClick: handleSubmit(onSubmit),
          loading: isJoiningByAccessCode,
        }}
        headerStyle={{ paddingTop }}
      >
        <FormLayout>
          <View style={styles.content}>
            <OrganizationIdentity
              name={organization?.name || ''}
              uri={organization?.logo || ''}
              card
            />
            <VText variant="sub">{`${t('description')}`}</VText>
            <FormInput
              control={control as any}
              error={errors.code}
              label={t('form.code.label')}
              name="code"
              placeholder={t('form.code.placeholder')}
              disabled={isJoiningByAccessCode}
              // #593: codes are usually upper case; the API matches them whatever the case
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>
        </FormLayout>
      </PageLayout>
      {/* sized to its content: the text is never cut on a small screen */}
      <Sheet ref={successRef} onDismiss={onSuccessDismiss} testID="access-code-success-sheet">
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
          label={`${t('modal.success.primary_action_label')}`}
          onPress={onCompleteVolunteerProfile}
          testID="access-code-complete-profile"
        />
        <View style={styles.link}>
          <InlineLink
            label={`${t('modal.success.secondary_action_label')}`}
            onPress={() => successRef.current?.dismiss()}
          />
        </View>
      </Sheet>
    </>
  );
};

export default JoinByAccessCode;

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
