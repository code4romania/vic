/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import FormSelect, { FormSelectProps, ISelectItem } from '../components/FormSelect';
import { getEventsByOrganizationId } from '../services/event/event.api';
import { formatDayMonth } from '../common/utils/event-format';

interface EventSelectProps extends Omit<FormSelectProps, 'options'> {
  organizationId: string;
  /** a last option that clears the event (key '') */
  noneLabel?: string;
}

const EventSelect = ({ organizationId, noneLabel, ...props }: EventSelectProps) => {
  const [structures, setStructures] = useState<ISelectItem[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const rawEvents = await getEventsByOrganizationId(organizationId);
      const mappedStructures = rawEvents.map((event) => ({
        label: event.name,
        key: event.id,
        // „13 NOV” on the right of the row, like the prototype's menu
        detail: formatDayMonth(event.startDate) || undefined,
      }));
      setStructures(mappedStructures);
    } catch {
      // the select stays empty; the form still shows its other fields
    }
  };

  return (
    <FormSelect
      {...props}
      options={
        noneLabel && structures.length ? [...structures, { key: '', label: noneLabel }] : structures
      }
    />
  );
};

export default EventSelect;
