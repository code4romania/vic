/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import i18n from '../common/config/i18n';
import { ListItem } from '../common/interfaces/list-item.interface';
import ServerSelect from '../components/ServerSelect';
import { getAllTemplatesForMyOrganization } from '../services/templates/templates.api';

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
}: TemplateSelectProps) => {
  // load templates from the database
  const loadTemplates = async (search: string): Promise<ListItem[]> => {
    try {
      const templates = await getAllTemplatesForMyOrganization(search);

      // map template to server select data type
      return templates.map((template) => ({
        value: template.id,
        label: template.name,
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
      id="template__select"
      label={label}
      value={defaultValue}
      loadOptions={loadTemplates}
      onChange={onSelect as any}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
      placeholder={`${i18n.t('general:select', { item: '' })}`}
      aria-invalid={!!errorMessage}
    />
  );
};

export default TemplateSelect;
