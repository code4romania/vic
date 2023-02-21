import {
  AdjustmentsVerticalIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useEffect, useMemo } from 'react';
import i18n from '../common/config/i18n';
import Card from '../layouts/CardLayout';
import Button from './Button';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import debouce from 'lodash.debounce';
import Input from './Input';

interface DataTableFiltersProps {
  children?: React.ReactNode;
  searchValue?: string | null;
  onSearch: (searchWord: string) => void;
  onResetFilters: () => void;
}

const DataTableFilters = ({
  children,
  searchValue,
  onSearch,
  onResetFilters,
}: DataTableFiltersProps) => {
  const [filtersCollapsed, setFiltersCollapsed] = useState<boolean>(false);
  const [searchWord, setSearchWord] = useState<string>('');

  useEffect(() => {
    if (searchValue === null) setSearchWord('');
  }, [searchValue]);

  // cleanup any side effects of deounce
  useEffect(() => {
    return () => {
      onDebouncedSearch.cancel();
    };
  }, []);

  const resetFilters = () => {
    onResetFilters();
    setFiltersCollapsed(true);
  };

  const onSearchValueChange = (value: string) => {
    setSearchWord(value);
    onDebouncedSearch(value);
  };

  const onDebouncedSearch = useMemo(() => {
    return debouce(onSearch, 800);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="relative w-full flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <Input
            id="search__filter"
            type="text"
            value={searchWord}
            onChange={(event) => onSearchValueChange(event.target.value)}
            placeholder={i18n.t('general:search').toString()}
          />
        </div>
        <div className="w-full items-center justify-end gap-1 md:gap-4 flex flex-2">
          {filtersCollapsed && (
            <Button
              type="button"
              className="btn-outline-secondary w-auto"
              label={i18n.t('general:filters.reset')}
              onClick={resetFilters}
              icon={<TrashIcon className="h-5 w-5" aria-hidden="true" />}
            />
          )}
          <Button
            type="button"
            className="btn-outline-secondary w-auto"
            label={
              filtersCollapsed ? i18n.t('general:filters.hide') : i18n.t('general:filters.show')
            }
            onClick={setFiltersCollapsed.bind(null, !filtersCollapsed)}
            icon={<AdjustmentsVerticalIcon className="h-5 w-5" aria-hidden="true" />}
          />
        </div>
      </CardHeader>
      {filtersCollapsed && (
        <CardBody>
          <div className="grid grid-cols-3 gap-2">{children}</div>
        </CardBody>
      )}
    </Card>
  );
};

export default DataTableFilters;
