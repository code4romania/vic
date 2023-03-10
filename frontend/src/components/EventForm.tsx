import React, { useEffect, useState } from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl, UseFormReset } from 'react-hook-form';
import i18n from '../common/config/i18n';
import { AttendanceType } from '../common/enums/attendance-type.enum';
import { IEvent } from '../common/interfaces/event.interface';
import FormLayout from '../layouts/FormLayout';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import FormInputImg from './FormInputImg';
import FormRadios from './FormRadios';
import FormTextarea from './FormTextarea';
import MultiSelect, { IMultiListItem, mapItemToMultiListItem } from './MultiSelect';
import StartingFormSection from './StartingFormSection';

export enum TargetType {
  PUBLIC = 'public',
  ALL = 'all',
  SELECT = 'select',
}

const TargetRadioOptions = [
  {
    key: TargetType.PUBLIC,
    label: i18n.t('events:form.target.public'),
  },
  {
    key: TargetType.ALL,
    label: i18n.t('events:form.target.all'),
  },
  {
    key: TargetType.SELECT,
    label: i18n.t('general:select', { item: i18n.t('volunteer:form.department.label') }),
  },
];

const RadioOptions = [
  { key: AttendanceType.SIMPLE, label: i18n.t('events:form.noting.simple') },
  { key: AttendanceType.MENTION, label: i18n.t('events:form.noting.mention') },
];

interface EventFormProps {
  control: Control<EventFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<EventFormTypes>>;
  disabled?: boolean;
  event?: IEvent;
  reset?: UseFormReset<EventFormTypes>;
  targetOptions?: IMultiListItem[];
  taskOpitons: IMultiListItem[];
}

export type EventFormTypes = {
  name: string;
  startDate: Date;
  isPublic: TargetType;
  endDate?: Date;
  location?: string;
  targetsIds: IMultiListItem[];
  description: string;
  logo?: string;
  mention?: string;
  attendanceType: AttendanceType;
  attendanceMention?: string;
  tasksIds: IMultiListItem[];
  observation?: string;
};

const EventForm = ({
  control,
  errors,
  disabled,
  event,
  reset,
  targetOptions,
  taskOpitons,
}: EventFormProps) => {
  const [showSelect, setShowSelect] = useState<TargetType>();
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceType>(
    event?.attendanceType || AttendanceType.SIMPLE,
  );

  useEffect(() => {
    if (event && reset)
      reset({
        name: event.name,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : event.endDate,
        location: event.location,
        isPublic: event.isPublic ? TargetType.PUBLIC : TargetType.SELECT,
        targetsIds: [...event.targets.map(mapItemToMultiListItem)],
        description: event.description,
        logo: event.logo,
        attendanceType: event.attendanceType,
        attendanceMention: event.attendanceMention,
        tasksIds: [...event.tasks.map(mapItemToMultiListItem)],
        observation: event.observation,
      });
  }, [event, reset]);

  // const onTargetRadioClick = (e: React.MouseEvent<HTMLInputElement>) => {
  //   setShowSelect(
  //     TargetType[(e.target as HTMLInputElement).value.toUpperCase() as keyof typeof TargetType],
  //   );
  // };

  const onTargetRadioClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const targetType = (e.currentTarget as HTMLInputElement).value as TargetType;
    setShowSelect(targetType);
  };

  const onAttendanceRadioClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const attendanceStatus = (e.currentTarget as HTMLInputElement).value as AttendanceType;
    setAttendanceStatus(attendanceStatus);
  };

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
                error={errors['startDate']?.message}
                dateFormat="dd.MM.yyyy, HH:mm"
                showTimeSelect
                timeIntervals={15}
                timeFormat="HH:mm"
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
                dateFormat="dd.MM.yyyy, HH:mm"
                showTimeSelect
                timeIntervals={15}
                timeFormat="HH:mm"
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
                label={`${i18n.t('events:form.location.label')}`}
                onChange={onChange}
                aria-invalid={errors['location']?.message ? 'true' : 'false'}
                id="events-form__name"
              />
            );
          }}
        />
        <div className="flex flex-col gap-1">
          <Controller
            key="isPublic"
            name="isPublic"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <FormRadios
                  name="isPublic"
                  readOnly={false}
                  options={TargetRadioOptions}
                  value={value}
                  errorMessage={errors['isPublic']?.message}
                  label={`${i18n.t('events:form.target.label')}`}
                  onChange={onChange}
                  onClick={onTargetRadioClick}
                  aria-invalid={errors['location']?.message ? 'true' : 'false'}
                  disabled={disabled}
                  defaultValue={value || TargetType.PUBLIC}
                />
              );
            }}
          />
          <Controller
            key="targetsIds"
            name="targetsIds"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <MultiSelect
                  options={targetOptions}
                  placeholder={`${i18n.t('events:form.target.placeholder')}`}
                  value={value}
                  onChange={onChange}
                  isDisabled={showSelect !== TargetType.SELECT}
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
        <hr className="border-cool-gray-200 mb-2 mt-10" />
        <StartingFormSection
          title={i18n.t('events:form.noting.label')}
          description={i18n.t('events:form.noting.description')}
        />
        <Controller
          key="attendanceType"
          name="attendanceType"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormRadios
                name="attendanceType"
                readOnly={false}
                options={RadioOptions}
                value={value}
                errorMessage={errors['attendanceType']?.message}
                label={`${i18n.t('events:form.noting.label')}`}
                onClick={onAttendanceRadioClick}
                onChange={onChange}
                aria-invalid={errors['location']?.message ? 'true' : 'false'}
                defaultValue={attendanceStatus}
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
                errorMessage={errors['attendanceMention']?.message}
                disabled={attendanceStatus === AttendanceType.SIMPLE}
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
        <StartingFormSection
          title={i18n.t('events:form.task.title')}
          description={i18n.t('events:form.task.description')}
        />
        <Controller
          key="tasksIds"
          name="tasksIds"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <MultiSelect
                label={`${i18n.t('events:form.task.label')}*`}
                options={taskOpitons}
                placeholder={`${i18n.t('events:form.target.placeholder')}`}
                value={value}
                onChange={onChange}
                helper={<p className="text-red-500">{errors['tasksIds']?.message}</p>}
              />
            );
          }}
        />
        <hr className="border-cool-gray-200 mb-2 mt-10" />
        <StartingFormSection
          title={i18n.t('events:form.observation.title')}
          description={i18n.t('events:form.observation.description')}
        />
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
                errorMessage={errors['observation']?.message}
              />
            );
          }}
        />
      </form>
    </FormLayout>
  );
};

export default EventForm;
