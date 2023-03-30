/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import i18n from '../common/config/i18n';
import { ListItem } from '../common/interfaces/list-item.interface';
import ServerSelect from '../components/ServerSelect';
import { getActivityTypes } from '../services/activity-type/activity-type.api';

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
      const tasks = await getActivityTypes(search);

      // map volunteers to server select data type
      return tasks.map((task) => ({
        value: task.id,
        label: task.name,
      }));
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
