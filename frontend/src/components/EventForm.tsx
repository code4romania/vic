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
import { AttendanceType } from '../common/enums/attendance-type.enum';
import FormLayout from '../layouts/FormLayout';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import FormUploadFile from './FormUploadFile';
import FormTextarea from './FormTextarea';
import { SelectItem } from './Select';
import FormSelect from './FormSelect';
import FormRadioGroup from './FormRadioGroup';
import Paragraph from './Paragraph';
import { DATE_FORMAT } from '../common/constants/patterns';

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

const RadioOptions = [
  { key: AttendanceType.SIMPLE, value: i18n.t('events:form.noting.simple') },
  { key: AttendanceType.MENTION, value: i18n.t('events:form.noting.mention') },
];

interface EventFormProps {
  control: Control<EventFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<EventFormTypes>>;
  watch?: UseFormWatch<EventFormTypes>;
  disabled?: boolean;
  resetField?: UseFormResetField<EventFormTypes>;
}

export type EventFormTypes = {
  name: string;
  startDate: Date;
  targets: SelectItem<string>[];
  description: string;
  tasks: SelectItem<string>[];
  targetType: TargetType;
  endDate?: Date;
  location?: string;
  logo?: string;
  mention?: string;
  attendanceType: AttendanceType;
  attendanceMention?: string;
  observation?: string;
};

const EventForm = ({ control, errors, disabled, watch, resetField }: EventFormProps) => {
  const targetType = watch && watch('targetType');
  const attendanceType = watch && watch('attendanceType');

  useEffect(() => {
    if (attendanceType === AttendanceType.SIMPLE) {
      resetField && resetField('attendanceMention');
    }
  }, [attendanceType]);

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
                disabled={disabled}
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
              <FormSelect
                placeholder={`${i18n.t('events:form.target.placeholder')}`}
                onChange={onChange}
                selected={value}
                errorMessage={errors.targets?.message}
                isDisabled={targetType !== TargetType.SELECT}
              />
            );
          }}
        />
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
        <Controller
          name="logo"
          key="logo"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormUploadFile
                value={value}
                errorMessage={errors.logo?.message}
                label={`${i18n.t('events:form.logo.label')}`}
                onChange={onChange}
              />
            );
          }}
        />
        <hr className="border-cool-gray-200 mb-2 mt-10" />
        <Paragraph title={i18n.t('events:form.noting.label')}>
          {i18n.t('events:form.noting.description')}
        </Paragraph>
        <Controller
          key="attendanceType"
          name="attendanceType"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormRadioGroup
                name="attendanceType"
                readOnly={false}
                options={RadioOptions}
                value={value}
                errorMessage={errors.attendanceType?.message}
                label={`${i18n.t('events:form.noting.label')}`}
                onChange={onChange}
                defaultValue={value}
              />
            );
          }}
        />
        <Controller
          key="attendanceMention"
          name="attendanceMention"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormTextarea
                label={i18n.t('events:form.mention.label')}
                defaultValue={value}
                onChange={onChange}
                errorMessage={errors.attendanceMention?.message}
                disabled={attendanceType === AttendanceType.SIMPLE}
                helper={
                  <small className="text-cool-gray-500">
                    {i18n.t('events:form.mention.description')}
                  </small>
                }
              />
            );
          }}
        />
        <hr className="border-cool-gray-200 mb-2 mt-10" />
        <Paragraph title={i18n.t('events:form.task.title')}>
          {i18n.t('events:form.task.description')}
        </Paragraph>
        <Controller
          key="tasks"
          name="tasks"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormSelect
                label={`${i18n.t('events:form.task.label')}*`}
                placeholder={`${i18n.t('events:form.target.placeholder')}`}
                selected={value}
                onChange={onChange}
                errorMessage={errors.tasks?.message}
              />
            );
          }}
        />
        <hr className="border-cool-gray-200 mb-2 mt-10" />
        <Paragraph title={i18n.t('events:form.observation.title')}>
          {i18n.t('events:form.observation.description')}
        </Paragraph>
        <Controller
          key="observation"
          name="observation"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormTextarea
                label={i18n.t('events:form.observation.label')}
                defaultValue={value}
                onChange={onChange}
                errorMessage={errors.observation?.message}
              />
            );
          }}
        />
      </form>
    </FormLayout>
  );
};

export default EventForm;
