/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import i18n from '../common/config/i18n';
import { ListItem } from '../common/interfaces/list-item.interface';
import ServerSelect from '../components/ServerSelect';
import { getCities } from '../services/location/location.api';

interface LocationSelectProps {
  label: string;
  value?: ListItem;
  defaultCity?: string;
  defaultCounty?: string;
  onSelect: (item: ListItem) => void;
}

const LocationSelect = ({
  label,
  value,
  defaultCity,
  defaultCounty,
  onSelect,
}: LocationSelectProps) => {
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

  // init selection using name from query
  useEffect(() => {
    (async () => {
      if (defaultCity && defaultCounty && !value) {
        const values = await getCities({ county: defaultCounty, city: defaultCity });
        if (values.length > 0) {
          const city = values[0];
          const selectedValue = {
            value: city.id.toString(),
            label: `${city.name}, ${city.county.abbreviation}`,
          };
          onSelect(selectedValue);
        }
      }
    })();
  }, []);

  return (
    <ServerSelect
      id="location__select"
      label={label}
      value={value}
      loadOptions={loadCities}
      placeholder={`${i18n.t('general:select', { item: '' })}`}
      onChange={onSelect as any}
    />
  );
};

export default LocationSelect;
