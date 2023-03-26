import React from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl } from 'react-hook-form';
import i18n from '../common/config/i18n';
import FormLayout from '../layouts/FormLayout';
import VolunteerSelect from '../containers/VolunteerSelect';
import { ListItem } from '../common/interfaces/list-item.interface';
import FormInput from './FormInput';
import FormDatePicker from './FormDatePicker';
import EventSelect from '../containers/EventSelect';
import TaskSelect from '../containers/TaskSelect';

interface ActivityLogFormProps {
  control: Control<ActivityLogFormTypes, object>;
  errors: FieldErrorsImpl<DeepRequired<ActivityLogFormTypes>>;
  disabled?: boolean;
}

export type ActivityLogFormTypes = {
  date: Date;
  hours: number;
  mentions?: string;
  volunteer: ListItem;
  event?: ListItem;
  task: ListItem;
};

const ActivityLogForm = ({ control, errors, disabled }: ActivityLogFormProps) => {
  return (
    <FormLayout>
      {!disabled && <p className="text-cool-gray-500">{i18n.t('activity_log:form.description')}</p>}
      <form>
        {!disabled && (
          <Controller
            key="volunteer"
            name="volunteer"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <VolunteerSelect
                  defaultValue={value}
                  onSelect={onChange}
                  label={i18n.t('volunteer:name', { status: '' })}
                  errorMessage={errors['volunteer']?.message}
                />
              );
            }}
          />
        )}
        <Controller
          key="event"
          name="event"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <EventSelect
                defaultValue={value}
                onSelect={onChange}
                label={i18n.t('general:event')}
                errorMessage={errors['event']?.message}
              />
            );
          }}
        />
        <Controller
          key="task"
          name="task"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <TaskSelect
                defaultValue={value}
                onSelect={onChange}
                label={i18n.t('general:task')}
                errorMessage={errors['task']?.message}
              />
            );
          }}
        />
        <Controller
          key="date"
          name="date"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormDatePicker
                name="date"
                label={i18n.t('general:date') as string}
                onChange={onChange}
                value={value}
                errorMessage={errors['date']?.message}
              />
            );
          }}
        />
        <Controller
          key="hours"
          name="hours"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormInput
                type="number"
                readOnly={false}
                value={value}
                errorMessage={errors['hours']?.message as string}
                label={`${i18n.t('activity_log:side_panel.hours')}`}
                onChange={onChange}
                id="add-activity-log-form__hours"
              />
            );
          }}
        />
        <Controller
          key="mentions"
          name="mentions"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormInput
                type="text"
                readOnly={false}
                value={value}
                errorMessage={errors['mentions']?.message as string}
                label={`${i18n.t('activity_log:side_panel.mention')}`}
                onChange={onChange}
                id="add-activity-log-form__mention"
              />
            );
          }}
        />
      </form>
    </FormLayout>
  );
};

export default ActivityLogForm;
