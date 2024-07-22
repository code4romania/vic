/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import i18n from '../common/config/i18n';
import { ListItem } from '../common/interfaces/list-item.interface';
// import ServerSelect from '../components/ServerSelect';
import { getCities } from '../services/location/location.api';
// import PaginatedSelect from '../components/PaginatedSelect';
// import ServerSelect from '../components/ServerSelect';
import PaginatedSelect from '../components/PaginatedSelect';

interface LocationSelectProps {
  label: string;
  value?: ListItem;
  defaultCity?: string;
  defaultCounty?: string;
  onSelect: (item: ListItem) => void;
}
interface LoadCitiesParams {
  options: ListItem[];
  hasMore: boolean;
  additional: { page: number };
}

const LocationSelect = ({
  label,
  value,
  defaultCity,
  defaultCounty,
  onSelect,
}: LocationSelectProps) => {
  // load cities from the database
  const loadCities = async (
    search: string,
    loadedOptions: ListItem[],
    { page }: { page: number },
  ): Promise<LoadCitiesParams> => {
    try {
      const cities = await getCities({ search: 'gal' });
      console.log(cities);
      // map cities to server select data type
      return {
        options: cities.map((city) => ({
          value: city.id.toString(),
          label: `${city.name}, ${city.county.abbreviation}`,
        })),
        // todo: hasMore
        hasMore: true,
        additional: { page: page + 1 },
      };
    } catch (error) {
      // show error
      console.error(error);
      // return empty error
      return {
        options: [],
        hasMore: false,
        additional: {
          page: page,
        },
      };
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
    <PaginatedSelect
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
