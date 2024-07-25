/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { AriaAttributes, useMemo } from 'react';
import i18n from '../common/config/i18n';
import { CONSTANTS } from '../common/constants/constants';
import { ListItem } from '../common/interfaces/list-item.interface';
import { ActivityTypeStatus } from '../common/enums/activity-type-status.enum';
import { useActivityTypeListItemsQuery } from '../services/activity-type/activity-type.service';
import BasicSelect from '../components/BasicSelect';

export interface TaskSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
  errorMessage?: string;
  helper?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
}

const TaskSelect = ({
  label,
  errorMessage,
  onSelect,
  defaultValue,
  helper,
  ...props
}: TaskSelectProps) => {
  // get response from api
  const { data: tasksResults } = useActivityTypeListItemsQuery({
    status: ActivityTypeStatus.ACTIVE,
  });
  // map tasks to select data type
  const tasks = useMemo(
    () =>
      tasksResults
        ? [
            ...tasksResults.map((task) => ({
              value: task.id,
              label: task.name,
            })),
            { value: CONSTANTS.OTHER, label: i18n.t('general:other') },
          ]
        : [{ value: CONSTANTS.OTHER, label: i18n.t('general:other') }],
    [tasksResults],
  );

  return (
    <BasicSelect
      id="task__select"
      label={label}
      placeholder={`${i18n.t('general:select', { item: '' })}`}
      defaultValue={defaultValue}
      options={tasks}
      onSelect={onSelect}
      errorMessage={errorMessage}
      aria-invalid={!!errorMessage}
      helper={helper}
      {...props}
    />
  );
};

export default TaskSelect;
