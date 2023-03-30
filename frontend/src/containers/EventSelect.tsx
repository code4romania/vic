/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { ListItem } from '../common/interfaces/list-item.interface';
import ServerSelect from '../components/ServerSelect';
import { getEvents } from '../services/event/event.api';

export interface EventSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
  errorMessage?: string;
  helper?: string;
}

const EventSelect = ({ label, defaultValue, onSelect, errorMessage, helper }: EventSelectProps) => {
  // load events from the database
  const loadEvents = async (search: string): Promise<ListItem[]> => {
    try {
      const events = await getEvents(0, 0, undefined, 'name', OrderDirection.ASC, search);

      // map events to server select data type
      return events.items.map((event) => ({
        value: event.id,
        label: event.name,
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
