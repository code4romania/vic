/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import FormSelect, { FormSelectProps, ISelectItem } from '../components/FormSelect';
import { getCities } from '../services/location/location.api';

interface CitySelectProps extends Omit<FormSelectProps, 'options'> {
  countyId: number;
}

const CitySelect = ({ countyId, ...props }: CitySelectProps) => {
  const [cities, setCities] = useState<ISelectItem[]>([]);

  useEffect(() => {
    if (countyId) {
      loadCities();
    }
  }, [countyId]);

  const loadCities = async () => {
    try {
      const rawCities = await getCities(countyId);
      const mappedCities = rawCities.map((city) => ({ label: city.name, key: city.id }));
      setCities(mappedCities);
    } catch (error: any) {
      console.log('error while loading counties', error);
    }
  };

  return <FormSelect {...props} options={cities} disabled={!countyId} />;
};

export default CitySelect;
