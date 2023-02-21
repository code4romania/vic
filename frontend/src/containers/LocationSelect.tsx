/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ListItem } from '../common/interfaces/list-item.interface';
import ServerSelect from '../components/ServerSelect';
import { getCities } from '../services/location/location.api';

interface LocationSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
}

const LocationSelect = ({ label, defaultValue, onSelect }: LocationSelectProps) => {
  // load cities from the database
  const loadCities = async (search: string): Promise<ListItem[]> => {
    try {
      const cities = await getCities(search);

      // map cities to server select data type
      return cities.map((city) => ({
        value: city.id.toString(),
        label: `${city.name}, ${city.county.abbreviation}`,
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
      id="location__select"
      label={label}
      value={defaultValue}
      loadOptions={loadCities}
      onChange={onSelect as any}
    />
  );
};

export default LocationSelect;
