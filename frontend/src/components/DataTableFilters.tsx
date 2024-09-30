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
import { classNames } from '../common/utils/utils';

interface DataTableFiltersProps {
  children?: React.ReactNode;
  searchValue?: string | null;
  isExpanded?: boolean;
  onSearch: (searchWord: string) => void;
  onResetFilters: () => void;
}

const DataTableFilters = ({
  children,
  searchValue,
  onSearch,
  onResetFilters,
  isExpanded = false,
}: DataTableFiltersProps) => {
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  const [searchWord, setSearchWord] = useState<string>('');

  useEffect(() => {
    setSearchWord(searchValue || '');
  }, []);

  useEffect(() => {
    if (isExpanded && children) {
      // Update on children change too
      setFiltersExpanded(true);
    }
  }, [isExpanded, children]);

  // cleanup any side effects of deounce
  useEffect(() => {
    return () => {
      onDebouncedSearch.cancel();
    };
  }, []);

  const resetFilters = () => {
    onResetFilters();
    setFiltersExpanded(true);
    setSearchWord('');
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
        <div className="w-full items-center justify-end gap-1 md:gap-4 flex flex-1">
          {filtersExpanded && (
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
              filtersExpanded ? i18n.t('general:filters.hide') : i18n.t('general:filters.show')
            }
            onClick={setFiltersExpanded.bind(null, !filtersExpanded)}
            icon={<AdjustmentsVerticalIcon className="h-5 w-5" aria-hidden="true" />}
          />
        </div>
      </CardHeader>
      <div className={classNames(filtersExpanded ? '' : 'hidden')}>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {children}
          </div>
        </CardBody>
      </div>
    </Card>
  );
};

export default DataTableFilters;
