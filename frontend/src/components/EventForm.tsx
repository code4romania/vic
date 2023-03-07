import React, { useEffect } from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl, UseFormReset } from 'react-hook-form';
import i18n from '../common/config/i18n';
import { IEvent } from '../common/interfaces/event.interface';
import FormLayout from '../layouts/FormLayout';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import FormInputImg from './FormInputImg';
import FormTextarea from './FormTextarea';
import MultiSelect, { IMultiListItem } from './MultiSelect';

interface EventFormProps {
  control: Control<EventFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<EventFormTypes>>;
  disabled?: boolean;
  event?: IEvent;
  reset?: UseFormReset<EventFormTypes>;
  targetsOptions: IMultiListItem[];
}

export type EventFormTypes = {
  name: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  targets: IMultiListItem[];
  description: string;
  logo?: string;
  mention?: string;
  tasks: [];
  observation?: string;
};

const EventForm = ({ control, errors, disabled, event, reset, targetsOptions }: EventFormProps) => {
  useEffect(() => {
    if (event && reset)
      reset({
        ...event,
        targets: [...targetsOptions],
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : event.endDate,
      });
  }, [event, reset]);

  return (
    <FormLayout>
      <form>
        <h3>{i18n.t('events:details')}</h3>

        <Controller
          key="name"
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormInput
                type="text"
                readOnly={false}
                value={value}
                errorMessage={errors['name']?.message}
                label={`${i18n.t('events:form.name.label')}*`}
                onChange={onChange}
                aria-invalid={errors['name']?.message ? 'true' : 'false'}
                id="events-form__name"
                disabled={disabled}
              />
            );
          }}
        />
        <Controller
          key="startDate"
          name="startDate"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormDatePicker
                name="startDate"
                label={`${i18n.t('events:form.start_date.label')}`}
                onChange={onChange}
                value={value}
                error={errors['startDate']?.message}
                disabled={disabled}
              />
            );
          }}
        />
        <Controller
          key="endDate"
          name="endDate"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormDatePicker
                name="endDate"
                label={i18n.t('events:form.end_date.label') as string}
                onChange={onChange}
                value={value}
                error={errors['endDate']?.message}
              />
            );
          }}
        />
        <Controller
          key="location"
          name="location"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormInput
                type="text"
                readOnly={false}
                value={value}
                errorMessage={errors['location']?.message}
                label={`${i18n.t('events:form.location.label')}*`}
                onChange={onChange}
                aria-invalid={errors['location']?.message ? 'true' : 'false'}
                id="events-form__name"
                disabled={disabled}
              />
            );
          }}
        />
        <div className="flex flex-col gap-1">
          <Controller
            key="targets"
            name="targets"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <MultiSelect
                  label={`${i18n.t('events:form.target.label')}`}
                  options={targetsOptions}
                  placeholder={`${i18n.t('events:form.target.placeholder')}`}
                  value={value || []}
                  onChange={onChange}
                />
              );
            }}
          />
          <small>{i18n.t('events:form.target.disclaimer')}</small>
        </div>
        <Controller
          name="description"
          key="description"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormTextarea
                label={i18n.t('events:form.description.label')}
                defaultValue={value}
                onChange={onChange}
                errorMessage={errors['description']?.message}
              />
            );
          }}
        />
        <Controller
          name="logo"
          key="logo"
          control={control}
          render={({ field: { onChange, value } }) => {
            console.log(value);
            return (
              <FormInputImg
                value={value}
                errorMessage={errors['logo']?.message}
                label={`${i18n.t('events:form.logo.label')}`}
                onChange={onChange}
                aria-invalid={errors['logo']?.message ? 'true' : 'false'}
              />
            );
          }}
        />
      </form>
    </FormLayout>
  );
};

export default EventForm;
