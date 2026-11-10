import React, { useEffect, useState } from 'react';
import FormSelect, { FormSelectProps, ISelectItem } from '../components/FormSelect';
import { getCounties } from '../services/location/location.api';

interface CountySelectProps extends Omit<FormSelectProps, 'options'> {}

const CountySelect = (props: CountySelectProps) => {
  const [counties, setCounties] = useState<ISelectItem[]>([]);

  useEffect(() => {
    loadCounties();
  }, []);

  const loadCounties = async () => {
    try {
      const rawCounties = await getCounties();
      const mappedCounties = rawCounties.map((county) => ({ label: county.name, key: county.id }));
      setCounties(mappedCounties);
    } catch {
      // the select stays empty; the form still shows its other fields
    }
  };

  return <FormSelect {...props} options={counties} />;
};

export default CountySelect;
