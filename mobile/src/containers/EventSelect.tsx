/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import FormSelect, { FormSelectProps, ISelectItem } from '../components/FormSelect';
import { getEventsByOrganizationId } from '../services/event/event.api';

interface EventSelectProps extends Omit<FormSelectProps, 'options'> {
  organizationId: string;
}

const EventSelect = ({ organizationId, ...props }: EventSelectProps) => {
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
    } catch (error: any) {
      console.log('error while loading events', error);
    }
  };

  return <FormSelect {...props} options={structures} />;
};

export default EventSelect;
