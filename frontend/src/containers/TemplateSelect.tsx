/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { ListItem } from '../common/interfaces/list-item.interface';
import { useTemplateListItemsQuery } from '../services/templates/templates.service';
import BasicSelect from '../components/BasicSelect';
import i18n from '../common/config/i18n';

export interface TemplateSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
  errorMessage?: string;
  helper?: string;
}

const TemplateSelect = ({
  label,
  defaultValue,
  onSelect,
  errorMessage,
  helper,
  ...props
}: TemplateSelectProps) => {
  const { data: templates } = useTemplateListItemsQuery('');
  const templatesOptions = useMemo(
    () =>
      templates?.map((template) => ({
        value: template.id,
        label: template.name,
      })),
    [templates],
  );

  return (
    <BasicSelect
      id="template__select"
      placeholder={`${i18n.t('general:select', { item: '' })}`}
      label={label}
      defaultValue={defaultValue}
      options={templatesOptions}
      onSelect={onSelect}
      errorMessage={errorMessage}
      helper={helper}
      aria-invalid={!!errorMessage}
      {...props}
    />
  );
};

export default TemplateSelect;
