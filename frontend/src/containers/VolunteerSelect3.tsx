import React from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { getVolunteers } from '../services/volunteer/volunteer.api';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';

//make an array with 500 objects where each one has a label and a value
// const options = Array.from({ length: 500 }, (_, index) => ({
//   label: `Label ${index}`,
//   value: Math.random() * 100,
// }));

const VolunteerSelect3 = ({
  defaultValue,
  onSelect,
}: {
  defaultValue: string;
  onSelect: () => void;
}) => {
  const loadOptions = async (search: string, loadedOptions, { page }) => {
    const response = await getVolunteers(
      VolunteerStatus.ACTIVE,
      2,
      page,
      undefined,
      undefined,
      search,
    );
    console.log('response', response);

    return {
      options: response.items.map((item) => ({ value: item.id, label: item.user.name })),
      hasMore: response.meta.currentPage > response.meta.totalPages,
      //   additional: {
      //     page: search ? 2 : page + 1,
      //   },
    };
  };

  return (
    <AsyncPaginate
      //   key={JSON.stringify(regionName)}
      value={defaultValue || null}
      loadOptions={loadOptions}
      getOptionValue={(option) => option.value}
      getOptionLabel={(option) => option.label}
      onChange={onSelect}
      isSearchable={false}
      placeholder="Select House"
      additional={{
        page: 1,
      }}
    />
  );
};

export default VolunteerSelect3;
