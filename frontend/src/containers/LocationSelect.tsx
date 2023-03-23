/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { ListItem } from '../common/interfaces/list-item.interface';
import ServerSelect from '../components/ServerSelect';
import { getCities } from '../services/location/location.api';

interface LocationSelectProps {
  label: string;
  defaultValue?: ListItem;
  queryValue?: string[] | null;
  onSelect: (item: ListItem) => void;
}

const LocationSelect = ({ label, defaultValue, queryValue, onSelect }: LocationSelectProps) => {
  const [querySelectItem, setQuerySelectItem] = useState<ListItem>();

  // load cities from the database
  const loadCities = async (search: string): Promise<ListItem[]> => {
    try {
      const cities = await getCities({ search });

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

  // TODO: improve this
  // init selection using name from query
  useEffect(() => {
    (async () => {
      if (queryValue && !defaultValue) {
        const [city, county] = queryValue;
        const values = await getCities({ county, city });
        if (values.length > 0) {
          const city = values[0];
          const selectedValue = {
            value: city.id.toString(),
            label: `${city.name}, ${city.county.abbreviation}`,
          };
          setQuerySelectItem(selectedValue);
          onSelect(selectedValue);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (querySelectItem) setQuerySelectItem(undefined);
  }, [defaultValue]);

  return (
    <ServerSelect
      id="location__select"
      label={label}
      value={defaultValue || querySelectItem}
      loadOptions={loadCities}
      onChange={onSelect as any}
    />
  );
};

export default LocationSelect;
