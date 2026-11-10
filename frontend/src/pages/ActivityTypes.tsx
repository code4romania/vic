import React, { useEffect, useState } from 'react';
import i18n from '../common/config/i18n';
import PageLayout from '../layouts/PageLayout';
import { useNavigate } from 'react-router';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import LoadErrorContent from '../components/LoadErrorContent';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useActivityTypesQuery } from '../services/activity-type/activity-type.service';
import { IActivityType } from '../common/interfaces/activity-type.interface';
import ActivityType from '../components/ActivityType';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { DivisionType } from '../common/enums/division-type.enum';
import { SelectItem } from '../components/Select';
import DataTableFilters from '../components/DataTableFilters';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatisticsCard from '../components/StatisticsCard';
import { ActivityTypeStatus } from '../common/enums/activity-type-status.enum';
import { ArchiveBoxIcon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ActivityTypesProps } from '../containers/query/ActivityTypesWithQueryParams';

const ActivityTypes = ({ query, setQuery }: ActivityTypesProps) => {
  // navigation
  const navigate = useNavigate();
  // filters
  const [branch, setBranch] = useState<SelectItem<string>>();
  const [department, setDepartment] = useState<SelectItem<string>>();
  const [role, setRole] = useState<SelectItem<string>>();

  // data fetching
  const {
    data: activityTypes,
    error: activityTypesError,
    isLoading: isFetchingActivityTypes,
    refetch,
  } = useActivityTypesQuery(query?.search as string, query?.branch, query?.department, query?.role);
  // the counters describe the whole organization: they do not change with the search or filters
  const { data: allActivityTypes } = useActivityTypesQuery();

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
    setQuery({}, 'replace');
  };

  const onSearch = (search: string) => {
    setQuery({ search: search || undefined }, 'replaceIn');
  };

  const onSetBranchFilter = (branch: SelectItem<string> | undefined) => {
    setBranch(branch);
    setQuery({ branch: branch?.value }, 'replaceIn');
  };

  const onSetDepartmentFilter = (department: SelectItem<string> | undefined) => {
    setDepartment(department);
    setQuery({ department: department?.value }, 'replaceIn');
  };

  const onSetRoleFilter = (role: SelectItem<string> | undefined) => {
    setRole(role);
    setQuery({ role: role?.value }, 'replaceIn');
  };

  const countOf = (status: ActivityTypeStatus) =>
    allActivityTypes ? `${allActivityTypes.filter((type) => type.status === status).length}` : '-';

  const counters = [
    { status: ActivityTypeStatus.ACTIVE, Icon: CheckCircleIcon, color: 'text-figure-green' },
    { status: ActivityTypeStatus.ARCHIVED, Icon: ArchiveBoxIcon, color: 'text-cool-gray-500' },
  ];

  return (
    <PageLayout>
      <PageHeader
        subtitle={i18n.t('activity_types:page.subtitle')}
        actions={
          <Button
            className="btn-primary"
            label={i18n.t('activity_types:page.add')}
            icon={<PlusIcon className="h-5 w-5" aria-hidden="true" />}
            onClick={onAddActivityType}
          />
        }
      >
        {i18n.t('side_menu:options.activity_types')}
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6">
        {counters.map(({ status, Icon, color }) => (
          <StatisticsCard
            key={status}
            label={i18n.t(`activity_types:page.counters.${status}.label`)}
            value={countOf(status)}
            icon={<Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />}
            info={
              <span className="text-cool-gray-500 font-roboto">
                {i18n.t(`activity_types:page.counters.${status}.info`)}
              </span>
            }
          />
        ))}
      </div>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        onResetFilters={onResetFilters}
        searchPlaceholder={`${i18n.t('activity_types:page.search')}`}
        results={
          activityTypesError
            ? undefined
            : i18n.t('activity_types:page.found', { count: activityTypes?.length ?? 0 })
        }
      >
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.branch')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onSetBranchFilter}
          selected={branch}
          defaultValue={query.branch}
          type={DivisionType.BRANCH}
        />
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.department')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onSetDepartmentFilter}
          selected={department}
          defaultValue={query.department}
          type={DivisionType.DEPARTMENT}
        />
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.role')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onSetRoleFilter}
          selected={role}
          defaultValue={query.role}
          type={DivisionType.ROLE}
        />
      </DataTableFilters>
      {isFetchingActivityTypes && <LoadingContent />}
      {!!activityTypesError && !isFetchingActivityTypes && (
        <Card>
          <LoadErrorContent onRetry={refetch} />
        </Card>
      )}
      {activityTypes && !isFetchingActivityTypes && (
        <Card>
          <CardHeader>
            <div>
              <h2>{i18n.t('side_menu:options.activity_types')}</h2>
              <p className="text-sm text-cool-gray-500">
                {i18n.t('activity_types:page.list_subtitle')}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
