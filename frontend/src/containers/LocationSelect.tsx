/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect } from 'react';
import i18n from '../common/config/i18n';
import { ListItem } from '../common/interfaces/list-item.interface';
import { getCities } from '../services/location/location.api';
import PaginatedSelect from '../components/PaginatedSelect';
import { LoadOptions } from 'react-select-async-paginate';
import { GroupBase } from 'react-select';

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
  const loadCities: LoadOptions<ListItem, GroupBase<ListItem>, any> = useCallback(
    async (search = '', loadedOptions, { page }): Promise<LoadCitiesParams> => {
      try {
        const citiesResponse = await getCities({ search, page, limit: 10 });

        // get the options that will be displayed inside the select list
        const options = citiesResponse.items.map((city) => ({
          value: city.id.toString(),
          label: `${city.name}, ${city.county.abbreviation}`,
        }));

        return {
          options,
          hasMore: page < citiesResponse.meta.totalPages,
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
    },
    [],
  );

  // init selection using name from query
  useEffect(() => {
    (async () => {
      if (defaultCity && defaultCounty && !value) {
        const values = await getCities({ county: defaultCounty, city: defaultCity });
        if (values.items.length > 0) {
          const city = values.items[0];
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
