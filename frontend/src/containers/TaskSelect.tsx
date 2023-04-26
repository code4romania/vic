/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import i18n from '../common/config/i18n';
import { CONSTANTS } from '../common/constants/constants';
import { ListItem } from '../common/interfaces/list-item.interface';
import ServerSelect from '../components/ServerSelect';
import { getActivityTypeListItems } from '../services/activity-type/activity-type.api';
import { ActivityTypeStatus } from '../common/enums/activity-type-status.enum';

export interface TaskSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
  errorMessage?: string;
  helper?: string;
}

const TaskSelect = ({ label, defaultValue, onSelect, errorMessage, helper }: TaskSelectProps) => {
  // load volunteers from the database
  const loadTasks = async (search: string): Promise<ListItem[]> => {
    try {
      const tasks = await getActivityTypeListItems({ search, status: ActivityTypeStatus.ACTIVE });

      // map volunteers to server select data type
      const results = tasks.map((task) => ({
        value: task.id,
        label: task.name,
      }));

      // add "Other" at the end
      return [...results, { value: CONSTANTS.OTHER, label: i18n.t('general:other') }];
    } catch (error) {
      // show error
      console.error(error);
      // return empty error
      return [];
    }
  };

  return (
    <ServerSelect
      id="task__select"
      label={label}
      value={defaultValue}
      loadOptions={loadTasks}
      onChange={onSelect as any}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
      placeholder={`${i18n.t('general:select', { item: '' })}`}
      aria-invalid={!!errorMessage}
    />
  );
};

export default TaskSelect;
