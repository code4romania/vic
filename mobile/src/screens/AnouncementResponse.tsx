import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import i18n from '../common/config/i18n';
import FormInput from '../components/FormInput';
import { StyleSheet, View } from 'react-native';
import { VText } from '../components/ui';
import { spacing } from '../common/theme/tokens';
import FormLayout from '../layouts/FormLayout';
import PageLayout from '../layouts/PageLayout';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { useRespondToAnouncementMutation } from '../services/anouncement/anouncement.service';

type ResponseForm = { comment: string };

const schema = yup.object({
  comment: yup
    .string()
    .trim()
    .required(`${i18n.t('anouncement_response:comment.required')}`)
    .max(500, `${i18n.t('anouncement_response:comment.max')}`),
});

// VIC 2.0 (#504): the volunteer answers an announcement with a comment, once
const AnouncementResponse = ({ navigation, route }: any) => {
  const { anouncementId, title } = route.params;
  const { t } = useTranslation('anouncement_response');
  const paddingTop = usePaddingTop();
  const { mutate: respond, isLoading } = useRespondToAnouncementMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResponseForm>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: { comment: '' },
  });

  const onSubmit = ({ comment }: ResponseForm) =>
    respond(
      { id: anouncementId, comment: comment.trim() },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: `${t('sent')}` });
          navigation.goBack();
        },
        onError: (error: any) => {
          const code = error?.response?.data?.code_error;
          Toast.show({
            type: 'error',
            text1: `${i18n.exists(`anouncement_response:errors.${code}`) ? t(`errors.${code}`) : t('errors.generic')}`,
          });
        },
      },
    );

  return (
    <PageLayout
      title={t('title')}
      onBackButtonPress={navigation.goBack}
      headerStyle={{ paddingTop }}
      actionsOptions={{
        primaryActionLabel: t('submit'),
        onPrimaryActionButtonClick: handleSubmit(onSubmit),
        loading: isLoading,
      }}
    >
      <FormLayout>
        <View style={styles.content}>
          <View style={styles.intro}>
            {!!title && (
              <VText variant="h3" accessibilityRole="header">
                {title}
              </VText>
            )}
            <VText variant="sub">{`${t('paragraph')}`}</VText>
          </View>
          <FormInput
            control={control as any}
            name="comment"
            label={t('comment.label')}
            placeholder={t('comment.placeholder')}
            error={errors.comment}
            disabled={isLoading}
            required={true}
            multiline
            maxLength={500}
          />
        </View>
      </FormLayout>
    </PageLayout>
  );
};

export default AnouncementResponse;

const styles = StyleSheet.create({
  // FormLayout's content sits at 16: 4 more align it with the 20pt gutter of the page title
  content: { gap: spacing.l, paddingHorizontal: spacing.gutter - spacing.l },
  intro: { gap: 6 },
});
