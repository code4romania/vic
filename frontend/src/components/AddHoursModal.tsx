import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { ListItem } from '../common/interfaces/list-item.interface';
import EventSelect from '../containers/EventSelect';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { useAddVolunteerHoursMutation } from '../services/activity-log/activity-log.service';
import Button from './Button';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import Modal from './Modal';

export type AddHoursForm = {
  hours: number;
  date: Date;
  mentions?: string;
  event?: ListItem;
};

const schema = yup.object({
  hours: yup
    .number()
    .typeError(`${i18n.t('activity_log:form.hours.required')}`)
    .integer(`${i18n.t('activity_log:form.hours.integer')}`)
    .min(1, `${i18n.t('activity_log:form.hours.min')}`)
    .max(24, `${i18n.t('activity_log:form.hours.max', { value: 24 })}`)
    .required(`${i18n.t('activity_log:form.hours.required')}`),
  date: yup
    .date()
    .typeError(`${i18n.t('general:invalid_date')}`)
    .required(`${i18n.t('activity_log:form.date.required')}`),
  mentions: yup.string().max(300, `${i18n.t('events:form.mention.max', { value: '300' })}`),
});

interface AddHoursModalProps {
  volunteerId: string;
  onClose: (saved?: boolean) => void;
}

// VIC 2.0 (#483): the NGO logs a volunteer's hours by hand: hours, date, description and an optional
// event. They are saved approved. Only an Active volunteer gets the button (the API refuses the rest).
const AddHoursModal = ({ volunteerId, onClose }: AddHoursModalProps) => {
  const { mutate: addHours, isLoading } = useAddVolunteerHoursMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddHoursForm>({
    resolver: yupResolver(schema),
    defaultValues: { date: new Date() },
  });

  const onSubmit = (data: AddHoursForm) => {
    addHours(
      { volunteerId, ...data },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t('volunteer:add_hours.saved'));
          onClose(true);
        },
        onError: (error) =>
          useErrorToast(
            InternalErrors.ACTIVITY_LOG_ERRORS.getError(error.response?.data.code_error),
          ),
      },
    );
  };

  return (
    <Modal title={i18n.t('volunteer:add_hours.title')} onClose={() => onClose()}>
      <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="hours"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormInput
              type="number"
              label={`${i18n.t('volunteer:add_hours.hours')}`}
              value={value}
              onChange={onChange}
              errorMessage={errors.hours?.message as string}
            />
          )}
        />
        <Controller
          name="date"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormDatePicker
              name="date"
              label={`${i18n.t('general:date')}`}
              value={value}
              onChange={onChange}
              errorMessage={errors.date?.message}
            />
          )}
        />
        <Controller
          name="mentions"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormTextarea
              label={`${i18n.t('volunteer:add_hours.description')}`}
              defaultValue={value}
              onChange={onChange}
              errorMessage={errors.mentions?.message as string}
            />
          )}
        />
        <Controller
          name="event"
          control={control}
          render={({ field: { onChange, value } }) => (
            <EventSelect
              label={`${i18n.t('volunteer:add_hours.event')}`}
              defaultValue={value}
              onSelect={onChange}
            />
          )}
        />
        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            label={i18n.t('general:cancel')}
            className="btn-outline-secondary"
            onClick={() => onClose()}
          />
          <Button
            type="submit"
            label={i18n.t('general:save')}
            className="btn-primary"
            disabled={isLoading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddHoursModal;
