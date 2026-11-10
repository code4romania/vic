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
  // Defaults to "Search..."; say what the search matches where it helps.
  searchPlaceholder?: string;
  onSearch: (searchWord: string) => void;
  onResetFilters: () => void;
  // Defaults to "Filtre și căutare"
  title?: string;
  // Under the filters: how many results, and actions on them (export)
  results?: React.ReactNode;
}

const DataTableFilters = ({
  children,
  searchValue,
  searchPlaceholder,
  onSearch,
  onResetFilters,
  title,
  results,
}: DataTableFiltersProps) => {
  // "collapsed" historically means the filter panel is open; open by default, as in the design
  const [filtersCollapsed, setFiltersCollapsed] = useState<boolean>(true);
  const [searchWord, setSearchWord] = useState<string>('');

  useEffect(() => {
    setSearchWord(searchValue || '');
  }, []);

  // cleanup any side effects of deounce
  useEffect(() => {
    return () => {
      onDebouncedSearch.cancel();
    };
  }, []);

  const resetFilters = () => {
    onResetFilters();
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
        <div>
          <h2>{title ?? i18n.t('general:filters.title')}</h2>
          <p className="text-sm text-cool-gray-500">{i18n.t('general:filters.subtitle')}</p>
        </div>
        <Button
          type="button"
          className="btn-text-primary px-2"
          label={i18n.t('general:filters.reset')}
          onClick={resetFilters}
          icon={<TrashIcon className="h-4 w-4" aria-hidden="true" />}
        />
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="relative w-full flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-cool-gray-400" aria-hidden="true" />
              </div>
              <Input
                id="search__filter"
                type="text"
                aria-label={searchPlaceholder ?? i18n.t('general:search').toString()}
                value={searchWord}
                onChange={(event) => onSearchValueChange(event.target.value)}
                placeholder={searchPlaceholder ?? i18n.t('general:search').toString()}
              />
            </div>
            {children && (
              <Button
                type="button"
                className="btn-outline-secondary w-auto"
                label={
                  filtersCollapsed ? i18n.t('general:filters.hide') : i18n.t('general:filters.show')
                }
                aria-expanded={filtersCollapsed}
                onClick={setFiltersCollapsed.bind(null, !filtersCollapsed)}
                icon={<AdjustmentsVerticalIcon className="h-5 w-5" aria-hidden="true" />}
              />
            )}
          </div>
          {children && (
            <div
              className={classNames(
                filtersCollapsed ? '' : 'hidden',
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4',
              )}
            >
              {children}
            </div>
          )}
          {results && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-cool-gray-200 text-sm text-cool-gray-600">
              {results}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default DataTableFilters;
