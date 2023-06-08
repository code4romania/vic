import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSetRsvpEventMutation } from '../services/event/event.service';
import useStore from '../store/store';
import { useEvent } from '../store/event/event.selector';
import { AttendanceType } from '../common/enums/attendance-type.enum';

type JoinEventFormTypes = {
  mention: string;
};

const schmeWithOptionalMention = yup
  .object({
    mention: yup
      .string()
      .min(2, `${i18n.t('event:join.form.mention.min', { value: 2 })}`)
      .max(250, `${i18n.t('event:join.form.mention.max', { value: 250 })}`),
  })
  .required();

const schemWithMandatoryMention = yup
  .object({
    mention: yup
      .string()
      .required(`${i18n.t('event:join.form.mention.required')}`)
      .min(2, `${i18n.t('event:join.form.mention.min', { value: 2 })}`)
      .max(250, `${i18n.t('event:join.form.mention.max', { value: 250 })}`),
  })
  .required();

const JoinEvent = ({ navigation, route }: any) => {
  console.log('JoinEvent');
  const { eventId } = route.params;
  const { t } = useTranslation('event');

  const { mutate: setRsvpEvent, isLoading } = useSetRsvpEventMutation();

  const { event } = useEvent();

  const { joinEvent } = useStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinEventFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(
      event?.attendanceType === AttendanceType.MENTION
        ? schemWithMandatoryMention
        : schmeWithOptionalMention,
    ),
  });

  const onSumit = (payload: JoinEventFormTypes) => {
    if (eventId) {
      setRsvpEvent(
        {
          eventId,
          rsvp: {
            going: true,
            ...payload,
          },
        },
        {
          onSuccess: () => {
            // got back and update event
            joinEvent();
            navigation.goBack();
          },
        },
      );
    }
  };

  return (
    <PageLayout
      title={t('join.header')}
      onBackButtonPress={navigation.goBack}
      actionsOptions={{
        onPrimaryActionButtonClick: handleSubmit(onSumit),
        primaryActionLabel: i18n.t('general:save'),
        loading: isLoading,
      }}
    >
      <FormLayout>
        <Text appearance="hint">{`${t('join.paragraph')}`}</Text>
        <FormInput
          control={control as any}
          error={errors.mention}
          name="mention"
          label={t('join.form.mention.label')}
          helper={`${t('join.form.mention.helper')}`}
          multiline={true}
          textStyle={styles.textArea}
          placeholder=""
        />
      </FormLayout>
    </PageLayout>
  );
};

export default JoinEvent;

const styles = StyleSheet.create({
  textArea: {
    minHeight: 52,
  },
});
