/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from 'react';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';
import { ListItem } from '../common/interfaces/list-item.interface';
import { getVolunteerListItems } from '../services/volunteer/volunteer.api';
import PaginatedSelect from '../components/PaginatedSelect';

export interface VolunteerSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
  errorMessage?: string;
  helper?: string;
  disabled?: boolean;
}

const VolunteerSelect = ({
  label,
  defaultValue,
  onSelect,
  errorMessage,
  helper,
  disabled,
}: VolunteerSelectProps) => {
  const loadVolunteers = useCallback(
    async (searchQuery: string = '', loadedOptions: unknown, { page }: { page: number }) => {
      try {
        //get response from api
        const response = await getVolunteerListItems({
          search: searchQuery,
          status: VolunteerStatus.ACTIVE,
          orderBy: 'user.name',
          orderDirection: OrderDirection.ASC,
          page: page,
          limit: 10,
        });

        // get the options that will be displayed inside the select list
        const options = response.items.map((volunteer) => ({
          value: volunteer.id,
          label: volunteer.name,
        }));

        return {
          options,
          hasMore: page < response.meta.totalPages,
          additional: {
            page: page + 1,
          },
        };
      } catch (error) {
        console.error(error);
        //TODO: Inteleg de ce, dar poate ar trebui sa punem si ceva error
        return {
          options: [],
          hasMore: false,
          additional: {
            page: page,
          },
        };
      }
    },
    [],
  );

  return (
    <PaginatedSelect
      id="volunteer__select"
      label={label}
      value={defaultValue}
      loadOptions={loadVolunteers}
      onChange={onSelect as any}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
      placeholder={`${i18n.t('general:select', { item: '' })}`}
      aria-invalid={!!errorMessage}
      disabled={disabled}
    />
  );
};

export default VolunteerSelect;
