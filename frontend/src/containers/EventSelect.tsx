/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { ListItem } from '../common/interfaces/list-item.interface';
// import ServerSelect from '../components/ServerSelect';
import { getEventListItems } from '../services/event/event.api';
import PaginatedSelect from '../components/PaginatedSelect';

export interface EventSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
  errorMessage?: string;
  helper?: string;
}

interface LoadEventsParams {
  options: ListItem[];
  hasMore: boolean;
  additional: { page: number };
}

const EventSelect = ({ label, defaultValue, onSelect, errorMessage, helper }: EventSelectProps) => {
  // load events from the database
  const loadEvents = async (
    search: string,
    loadedOptions: unknown,
    { page }: { page: number },
  ): Promise<LoadEventsParams> => {
    try {
      const events = await getEventListItems({
        search,
        orderBy: 'name',
        orderDirection: OrderDirection.ASC,
        page: page,
      });
      console.log(events);
      console.log(loadedOptions);
      console.log(page);

      // map events to server select data type
      return {
        options: events.items.map((event) => ({
          value: event.id,
          label: event.name,
        })),
        hasMore: page < events.meta.totalPages,
        additional: {
          page: page + 1,
        },
      };
    } catch (error) {
      // show error
      console.error(error);
      // return empty error
      // return [];
      return {
        options: [],
        hasMore: false,
        additional: {
          page: page,
        },
      };
    }
  };

  return (
    <PaginatedSelect
      id="event__select"
      label={label}
      value={defaultValue}
      loadOptions={loadEvents}
      onChange={onSelect as any}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
      placeholder={`${i18n.t('general:select', { item: '' })}`}
      aria-invalid={!!errorMessage}
    />
  );
};

export default EventSelect;
