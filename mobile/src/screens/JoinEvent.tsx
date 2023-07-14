import React from 'react';
import { Text } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormInput from '../components/FormInput';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useSetRsvpEventMutation } from '../services/event/event.service';
import useStore from '../store/store';
import ModalLayout from '../layouts/ModalLayout';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';

type JoinEventFormTypes = {
  mention: string;
};

const schema = yup
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

  const { joinEvent } = useStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinEventFormTypes>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
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
          onError: (error: any) =>
            Toast.show({
              type: 'error',
              text1: `${InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error)}`,
            }),
        },
      );
    }
  };

  return (
    <ModalLayout
      title={t('join.header')}
      onDismiss={navigation.goBack}
      actionsOptions={{
        onActionButtonClick: handleSubmit(onSumit),
        actionLabel: t('general:save'),
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
          placeholder=""
        />
      </FormLayout>
    </ModalLayout>
  );
};

export default JoinEvent;
