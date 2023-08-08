import React, { useMemo, useRef } from 'react';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';
import { Text, useTheme } from '@ui-kitten/components';
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
import Paragraph from '../components/Paragraph';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import BottomSheet from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import { renderBackdrop } from '../components/BottomSheet';
import { SvgXml } from 'react-native-svg';
import successIcon from '../assets/svg/success-icon';
import Button from '../components/Button';
import InlineLink from '../components/InlineLink';

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
  const theme = useTheme();
  const { t } = useTranslation('access_code');
  // get selected organization from state
  const { organization } = useOrganization();
  // join by access code
  const {
    data: volunteer,
    isLoading: isJoiningByAccessCode,
    mutate: joinOrganization,
  } = useJoinByAccessCodeMutation();

  // bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  // bottom sheet snap points
  const snapPoints = useMemo(() => [1, 410], []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessCodeFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const onOpenBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const onSubmit = (payload: AccessCodeFormTypes) => {
    // build the access request payload
    const joinPayload = {
      organizationId: organization?.id as string,
      code: payload.code,
    };

    // make the access request
    joinOrganization(joinPayload, {
      onSuccess: () => {
        // show modal which will eventually become bottom sheet
        onOpenBottomSheet();
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
    onCloseBottomSheet();
    navigation.navigate('create-volunteer', {
      volunteerId: volunteer?.id,
    });
  };

  const closeBottomSheet = () => {
    onCloseBottomSheet();
    navigation.goBack();
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
      >
        <FormLayout>
          <OrganizationIdentity name={organization?.name || ''} uri={organization?.logo || ''} />
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2">{`${t('title')}`}</Text>
          <Text allowFontScaling={ALLOW_FONT_SCALLING} appearance="hint">{`${t(
            'description',
          )}`}</Text>
          <FormInput
            control={control as any}
            error={errors.code}
            label={t('title')}
            name="code"
            placeholder={t('form.code.placeholder')}
            disabled={isJoiningByAccessCode}
          />
        </FormLayout>
      </PageLayout>
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
      >
        <View style={styles.container}>
          <SvgXml xml={successIcon} height={100} width={100} />
          <View style={styles.textContainer}>
            <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h1">
              {`${t('modal.success.heading')}`}
            </Text>
            <Paragraph>{`${t('modal.success.paragraph')}`}</Paragraph>
          </View>
          <View style={styles.buttonsContainer}>
            <Button
              label={`${t('modal.success.primary_action_label')}`}
              status={'success'}
              onPress={onCompleteVolunteerProfile}
            />
            <InlineLink
              label={`${t('modal.success.secondary_action_label')}`}
              onPress={closeBottomSheet}
              style={{ color: theme['cool-gray-700'] }}
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

export default JoinByAccessCode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 24,
    paddingVertical: 24,
  },
  textContainer: {
    paddingHorizontal: 40,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  buttonsContainer: {
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
