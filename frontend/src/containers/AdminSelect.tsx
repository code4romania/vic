/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { ListItem } from '../common/interfaces/list-item.interface';
// import ServerSelect from '../components/ServerSelect';
import { getAdminsListItems } from '../services/admin/admin.api';
import PaginatedSelect from '../components/PaginatedSelect';

export interface AdminSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
}

interface LoadAdminsParams {
  options: ListItem[];
  hasMore: boolean;
  additional: { page: number };
}

const AdminSelect = ({ label, defaultValue, onSelect }: AdminSelectProps) => {
  // load admins from the database
  const loadVolunteers = async (
    search: string,
    loadedOptions: ListItem[],
    { page }: { page: number },
  ): Promise<LoadAdminsParams> => {
    try {
      const admins = await getAdminsListItems({
        page,
        limit: 10,
        search,
        orderBy: 'name',
        orderDirection: OrderDirection.ASC,
      });

      // map admins to server select data type
      return {
        options: admins.items.map((admin) => ({
          value: admin.id,
          label: admin.name,
        })),
        hasMore: page < admins.meta.totalPages,
        additional: { page: page + 1 },
      };
    } catch (error) {
      // show error
      console.error(error);
      // return empty error
      return {
        options: [],
        hasMore: false,
        additional: { page: page },
      };
    }
  };

  return (
    <PaginatedSelect
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
