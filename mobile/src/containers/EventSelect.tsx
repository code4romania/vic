/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import FormSelect, { FormSelectProps, ISelectItem } from '../components/FormSelect';
import { getEventsByOrganizationId } from '../services/event/event.api';

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
      const mappedStructures = rawEvents.map((structure) => ({
        label: structure.name,
        key: structure.id,
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
