import React, { useEffect, useState } from 'react';
import i18n from '../common/config/i18n';
import PageLayout from '../layouts/PageLayout';
import { useNavigate } from 'react-router';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useActivityTypesQuery } from '../services/activity-type/activity-type.service';
import { IActivityType } from '../common/interfaces/activity-type.interface';
import ActivityType from '../components/ActivityType';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { DivisionType } from '../common/enums/division-type.enum';
import { SelectItem } from '../components/Select';
import DataTableFilters from '../components/DataTableFilters';
import PageHeaderAdd from '../components/PageHeaderAdd';
import { StringParam, useQueryParams } from 'use-query-params';

export const ACTIVITY_TYPES_QUERY_PARAMS = {
  search: StringParam,
  branch: StringParam,
  department: StringParam,
  role: StringParam,
};

const ActivityTypes = () => {
  // navigation
  const navigate = useNavigate();
  // filters
  const [branch, setBranch] = useState<SelectItem<string>>();
  const [department, setDepartment] = useState<SelectItem<string>>();
  const [role, setRole] = useState<SelectItem<string>>();
  // query params
  const [queryParams, setQueryParams] = useQueryParams(ACTIVITY_TYPES_QUERY_PARAMS);

  // data fetching
  const {
    data: activityTypes,
    error: activityTypesError,
    isLoading: isFetchingActivityTypes,
  } = useActivityTypesQuery(queryParams?.search as string, branch?.key, department?.key, role?.key);

  // error handling
  useEffect(() => {
    if (activityTypesError)
      useErrorToast(
        InternalErrors.ACTIVITY_TYPE_ERRORS.getError(activityTypesError.response?.data.code_error),
      );
  }, [activityTypesError]);

  const onAddActivityType = () => {
    navigate('add');
  };

  const onActivityTypeClick = (id: string) => {
    navigate(`edit/${id}`);
  };

  const onResetFilters = () => {
    setBranch(undefined);
    setDepartment(undefined);
    setRole(undefined);
    setQueryParams({});
  };

  const onSearch = (search: string) => {
    setQueryParams({
      ...queryParams,
      search,
    });
  };

  return (
    <PageLayout>
      <PageHeaderAdd
        label={`${i18n.t('general:add', { item: i18n.t('general:category').toLowerCase() })}`}
        onAddButtonPress={onAddActivityType}
      >
        {i18n.t('side_menu:options.activity_types')}
      </PageHeaderAdd>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={queryParams?.search}
        onResetFilters={onResetFilters}
      >
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.branch')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={setBranch}
          selected={branch}
          type={DivisionType.BRANCH}
        />
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.department')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={setDepartment}
          selected={department}
          type={DivisionType.DEPARTMENT}
        />
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.role')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={setRole}
          selected={role}
          type={DivisionType.ROLE}
        />
      </DataTableFilters>
      {isFetchingActivityTypes && <LoadingContent />}
      {activityTypes && !isFetchingActivityTypes && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('side_menu:options.activity_types')}</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:py-4">
              {activityTypes.map((activityType: IActivityType) => (
                <ActivityType
                  key={activityType.id}
                  activityType={activityType}
                  onClick={onActivityTypeClick}
                />
              ))}
            </div>
            {activityTypes.length === 0 && !isFetchingActivityTypes && (
              <div className="flex items-center justify-center">
                <EmptyContent description={i18n.t('general:empty_table')} />
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </PageLayout>
  );
};

export default ActivityTypes;
