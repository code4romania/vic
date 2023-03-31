/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { ListItem } from '../common/interfaces/list-item.interface';
import ServerSelect from '../components/ServerSelect';
import { getAdminsListItems } from '../services/admin/admin.api';

export interface AdminSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
}

const AdminSelect = ({ label, defaultValue, onSelect }: AdminSelectProps) => {
  // load admins from the database
  const loadVolunteers = async (search: string): Promise<ListItem[]> => {
    try {
      const admins = await getAdminsListItems({
        search,
        orderBy: 'name',
        orderDirection: OrderDirection.ASC,
      });

      // map admins to server select data type
      return admins.items.map((admin) => ({
        value: admin.id,
        label: admin.name,
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
      id="admin__select"
      label={label}
      value={defaultValue}
      loadOptions={loadVolunteers}
      onChange={onSelect as any}
      placeholder={`${i18n.t('general:select', { item: '' })}`}
    />
  );
};

export default AdminSelect;
