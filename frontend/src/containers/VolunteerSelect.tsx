/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
// import i18n from '../common/config/i18n';
// import { OrderDirection } from '../common/enums/order-direction.enum';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';
import { ListItem } from '../common/interfaces/list-item.interface';
import ServerSelect from '../components/ServerSelect';
// import { getVolunteerListItems } from '../services/volunteer/volunteer.api';
// import { useInfiniteQuery } from 'react-query';
// import { IPaginatedEntity } from '../common/interfaces/paginated-entity.interface';
// import { useVolunteersQuery } from '../services/volunteer/volunteer.service';
import { getVolunteers } from '../services/volunteer/volunteer.api';
import { useInfiniteQuery } from 'react-query';

export interface VolunteerSelectProps {
  label: string;
  defaultValue?: ListItem;
  onSelect: (item: ListItem) => void;
  errorMessage?: string;
  helper?: string;
  disabled?: boolean;
}

const VolunteerSelect = ({
  label,
  defaultValue,
  onSelect,
  errorMessage,
  helper,
  disabled,
}: VolunteerSelectProps) => {
  // const loadOptions = useCallback(
  //   async (input: string) => {
  //     const queryKey = [
  //       'volunteers',
  //       VolunteerStatus.ACTIVE,
  //       10, // limit
  //       1, // page
  //       undefined, // orderBy
  //       undefined, // orderDirection
  //       input, // search
  //     ];

  //     const data = await queryClient.fetchQuery(queryKey, () =>
  //       getVolunteers(
  //         VolunteerStatus.ACTIVE,
  //         2,
  //         1,
  //         undefined,
  //         undefined,
  //         input,
  //         undefined,
  //         undefined,
  //         undefined,
  //         undefined,
  //         undefined,
  //         undefined,
  //         undefined,
  //         undefined,
  //       ),
  //     );

  //     return (
  //       data?.items?.map((volunteer) => ({
  //         value: volunteer.id,
  //         label: volunteer.user.name,
  //       })) || []
  //     );
  //   },
  //   [queryClient],
  // );

  //  ============================================================================================================================================
  // const useVolunteersInfiniteQuery = (search: string = '') => {
  //   return useInfiniteQuery(
  //     ['volunteers'],
  //     ({ pageParam = 1 }) =>
  //       getVolunteers(VolunteerStatus.ACTIVE, 2, pageParam, undefined, undefined, search),
  //     {
  //       getNextPageParam: (lastPage) => {
  //         const { currentPage, totalPages } = lastPage.meta;
  //         return currentPage < totalPages ? currentPage + 1 : undefined;
  //       },
  //     },
  //   );
  // };

  // const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useVolunteersInfiniteQuery('');
  // const options =
  //   data?.pages
  //     .flatMap((page) => page.items)
  //     .map((item) => ({ value: item.id, label: item.user.name })) || [];

  // const handleScrollToBottom = () => {
  //   console.log('scrolled to bottom');
  //   if (hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // };
  // ================================================================================================================================================
  const useVolunteersInfiniteQuery = (search: string = '') => {
    return useInfiniteQuery(
      ['volunteers', search],
      ({ pageParam = 1 }) =>
        getVolunteers(VolunteerStatus.ACTIVE, 2, pageParam, undefined, undefined, search),
      {
        getNextPageParam: (lastPage) => {
          const { currentPage, totalPages } = lastPage.meta;
          return currentPage < totalPages ? currentPage + 1 : undefined;
        },
      },
    );
  };

  const useLoadOptions = () => {
    const [search, setSearch] = useState('');
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
      useVolunteersInfiniteQuery(search);

    const loadOptions = async (inputValue: string, callback: (options: any[]) => void) => {
      setSearch(inputValue);
      const options =
        data?.pages
          .flatMap((page) => page.items)
          .map((item) => ({ value: item.id, label: item.user.name })) || [];
      console.log(options);
      callback(options);
    };

    const handleScrollToBottom = () => {
      console.log('handle scroll to bottom...');
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    return { loadOptions, handleScrollToBottom };
  };

  const { loadOptions, handleScrollToBottom } = useLoadOptions();

  return (
    <ServerSelect
      id="volunteer__select"
      loadOptions={loadOptions}
      label={label}
      value={defaultValue}
      onChange={onSelect as any}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
      placeholder="Select a volunteer"
      aria-invalid={!!errorMessage}
      disabled={disabled}
      onMenuScrollToBottom={handleScrollToBottom}
    />
  );
};

export default VolunteerSelect;
