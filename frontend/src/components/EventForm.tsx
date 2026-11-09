import React, { useEffect } from 'react';
import {
  Control,
  Controller,
  DeepRequired,
  FieldErrorsImpl,
  UseFormResetField,
  UseFormWatch,
} from 'react-hook-form';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import { SelectItem } from './Select';
import FormRadioGroup from './FormRadioGroup';
import { DATE_FORMAT } from '../common/constants/patterns';
import TargetsMultiSelect from '../containers/TargetsMultiSelect';
import { EventStatus } from '../common/enums/event-status';

export enum TargetType {
  PUBLIC = 'public',
  ALL = 'all',
  SELECT = 'select',
}

const TargetRadioOptions = [
  {
    key: TargetType.PUBLIC,
    value: i18n.t('events:form.target.public'),
  },
  {
    key: TargetType.ALL,
    value: i18n.t('events:form.target.all'),
  },
  {
    key: TargetType.SELECT,
    value: i18n.t('general:select', { item: i18n.t('volunteer:form.department.label') }),
  },
];

interface EventFormProps {
  control: Control<EventFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<EventFormTypes>>;
  watch?: UseFormWatch<EventFormTypes>;
  resetField?: UseFormResetField<EventFormTypes>;
  isEditForm?: boolean;
  eventStatus?: EventStatus;
}

export type EventFormTypes = {
  name: string;
  startDate: Date;
  description: string;
  location?: string;
  endDate?: Date;
  // Maximum number of registered volunteers; empty = no limit
  capacity?: number | null;

  targetType: TargetType;
  targets?: SelectItem<string>[];

  status?: EventStatus;
};

const EventForm = ({
  control,
  errors,
  watch,
  resetField,
  isEditForm,
  eventStatus,
}: EventFormProps) => {
  const targetType = watch && watch('targetType');

  useEffect(() => {
    if (targetType !== TargetType.SELECT) {
      resetField && resetField('targets');
    }
  }, [targetType]);

  return (
    <FormLayout>
      <form>
        <Controller
          key="name"
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormInput
                type="text"
                label={`${i18n.t('events:form.name.label')}*`}
                value={value}
                errorMessage={errors.name?.message}
                onChange={onChange}
                id="events-form__name"
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
                label={`${i18n.t('events:form.start_date.label')}*`}
                onChange={onChange}
                value={value}
                errorMessage={errors.startDate?.message}
                dateFormat={DATE_FORMAT.DD_MM_YY_HH_MM}
                showTimeSelect
                timeIntervals={15}
                timeFormat={DATE_FORMAT.HH_MM}
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
                errorMessage={errors.endDate?.message}
                dateFormat={DATE_FORMAT.DD_MM_YY_HH_MM}
                showTimeSelect
                timeIntervals={15}
                timeFormat={DATE_FORMAT.HH_MM}
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
                errorMessage={errors.location?.message}
                label={`${i18n.t('events:form.location.label')}`}
                onChange={onChange}
                id="events-form__name"
              />
            );
          }}
        />
        <Controller
          key="capacity"
          name="capacity"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormInput
                type="number"
                min={1}
                readOnly={false}
                value={value ?? ''}
                errorMessage={errors.capacity?.message}
                label={`${i18n.t('events:form.capacity.label')}`}
                helper={
                  <small className="text-cool-gray-500">
                    {i18n.t('events:form.capacity.helper')}
                  </small>
                }
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  onChange(event.target.value === '' ? null : Number(event.target.value))
                }
                id="events-form__capacity"
              />
            );
          }}
        />
        <div className="flex flex-col gap-2">
          <Controller
            key="targetType"
            name="targetType"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <FormRadioGroup
                  name="targetType"
                  readOnly={false}
                  options={TargetRadioOptions}
                  value={value}
                  errorMessage={errors.targetType?.message}
                  label={`${i18n.t('events:form.target.label')}`}
                  onChange={onChange}
                  disabled={isEditForm && eventStatus !== EventStatus.DRAFT}
                  defaultValue={value}
                />
              );
            }}
          />
          <Controller
            key="targets"
            name="targets"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <TargetsMultiSelect
                  placeholder={`${i18n.t('events:form.target.placeholder')}`}
                  onChange={onChange}
                  selected={value}
                  isDisabled={
                    isEditForm
                      ? eventStatus !== EventStatus.DRAFT || targetType !== TargetType.SELECT
                      : targetType !== TargetType.SELECT
                  }
                  helper={
                    errors.targets?.message ? (
                      <p className="text-red-500">{errors.targets?.message}</p>
                    ) : (
                      i18n.t('announcement:form.target.disclaimer')
                    )
                  }
                />
              );
            }}
          />
        </div>
        <Controller
          name="description"
          key="description"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormTextarea
                label={`${i18n.t('events:form.description.label')}*`}
                defaultValue={value}
                onChange={onChange}
                errorMessage={errors.description?.message}
              />
            );
          }}
        />
      </form>
    </FormLayout>
  );
};

export default EventForm;
