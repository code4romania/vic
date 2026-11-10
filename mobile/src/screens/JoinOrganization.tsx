import React, { useRef } from 'react';
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
import { useCreateAccessrequestMutation } from '../services/access-request/access-request.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import successIcon from '../assets/svg/success-icon';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Sheet, VButton } from '../components/ui';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
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
        // show modal which will eventually become bottom sheet
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
          <OrganizationIdentity uri={logo} name={name} />
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2">{`${t(
            'registration_form',
          )}`}</Text>
          <Text allowFontScaling={ALLOW_FONT_SCALLING} appearance="hint">{`${t('complete')}`}</Text>
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
      {/* sized to its content: the text is never cut on a small screen */}
      <Sheet
        ref={bottomSheetRef}
        title={`${t('modal.success.heading')}`}
        subtitle={`${t('modal.success.paragraph')}`}
        onDismiss={() => {
          if (leavingTo.current === 'search') {
            navigation.navigate('search');
          } else {
            navigation.goBack();
          }
        }}
        testID="join-success-sheet"
      >
        <View style={styles.icon}>
          <SvgXml xml={successIcon} height={88} width={88} />
        </View>
        <VButton
          label={t('modal.success.primary_action_label')}
          onPress={onSearchNewOrganizations}
        />
        <VButton
          variant="soft"
          label={t('modal.success.secondary_action_label')}
          onPress={() => bottomSheetRef.current?.dismiss()}
        />
      </Sheet>
    </>
  );
};

export default JoinOrganization;

const styles = StyleSheet.create({
  icon: { alignItems: 'center' },
});
