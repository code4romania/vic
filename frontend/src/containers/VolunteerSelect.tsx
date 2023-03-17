/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';
import { ListItem } from '../common/interfaces/list-item.interface';
import ServerSelect from '../components/ServerSelect';
import { getVolunteers } from '../services/volunteer/volunteer.api';

export interface VolunteerSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
  errorMessage?: string;
  helper?: string;
}

const VolunteerSelect = ({
  label,
  defaultValue,
  onSelect,
  errorMessage,
  helper,
}: VolunteerSelectProps) => {
  // load volunteers from the database
  const loadVolunteers = async (search: string): Promise<ListItem[]> => {
    try {
      const volunteers = await getVolunteers(
        VolunteerStatus.ACTIVE,
        5,
        1,
        'user.name',
        OrderDirection.ASC,
        search,
      );

      // map volunteers to server select data type
      return volunteers.items.map((volunteer) => ({
        value: volunteer.id,
        label: volunteer.user.name,
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
      id="volunteer__select"
      label={label}
      value={defaultValue}
      loadOptions={loadVolunteers}
      onChange={onSelect as any}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    />
  );
};

export default VolunteerSelect;
