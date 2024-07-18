import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';

interface IOption {
  label: string;
  value: string;
}

const options: IOption[] = [
  // generate 1000 more options
  ...Array.from({ length: 1000 }, (_, i) => ({
    label: `Option ${i + 6}`,
    value: `option-${i + 6}`,
  })),
];

// paginate the options based on search value with a method
const loadOptions = async (search: string, page: number = 1): Promise<IOption[]> => {
  // Simulate an API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  );

  const pageSize = 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return filteredOptions.slice(startIndex, endIndex);
};

const VolunteerSelect2 = () => {
  const [search, setSearch] = useState<string>('');
  const [values, setValues] = useState<IOption[]>([]);
  const [page, setPage] = useState<number>(1);

  console.log('values', values);

  useEffect(() => {
    const loadData = async () => {
      const data = await loadOptions(search, 5);
      setValues(data);
    };

    loadData();
  }, [search]);

  useEffect(() => {
    const loadData = async () => {
      const data = await loadOptions(search, page * 5);
      setValues((prevValues) => [...prevValues, ...data]);
    };

    loadData();
  }, [page]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <AsyncSelect
      onInputChange={handleSearch}
      options={values}
      defaultOptions={values}
      onMenuScrollToBottom={() => setPage((prevPage) => prevPage + 1)}
    />
  );
};

export default VolunteerSelect2;
