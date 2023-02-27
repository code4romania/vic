import React, { useEffect, useState } from 'react';
import i18n from '../common/config/i18n';
import Button from '../components/Button';
import PageLayout from '../layouts/PageLayout';
import { PlusIcon } from '@heroicons/react/24/solid';
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
import DataTableFilters from '../components/DataTableFilters';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { DivisionType } from '../common/enums/division-type.enum';
import { SelectItem } from '../components/Select';

const ActivityTypes = () => {
  // navigation
  const navigate = useNavigate();
  //filters
  const [search, setSearch] = useState<string>();
  const [branch, setBranch] = useState<SelectItem<string>>();
  const [department, setDepartment] = useState<SelectItem<string>>();
  const [role, setRole] = useState<SelectItem<string>>();

  // data fetching
  const {
    data: activityTypes,
    error: activityTypesError,
    isLoading: isFetchingActivityTypes,
  } = useActivityTypesQuery(search, branch?.key, department?.key, role?.key);

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

  const onBranchChange = (item: SelectItem<string>) => {
    setBranch(item);
  };
  const onDepartmentChange = (item: SelectItem<string>) => {
    setDepartment(item);
  };
  const onRoleChange = (item: SelectItem<string>) => {
    setRole(item);
  };

  const onResetFilters = () => {
    setBranch(undefined);
    setDepartment(undefined);
    setRole(undefined);
    setSearch(undefined);
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-between">
        <h1>{i18n.t('side_menu:options.activity_types')}</h1>
        <Button
          label={i18n.t('general:add', { item: i18n.t('general:category').toLowerCase() })}
          className="btn-primary"
          icon={<PlusIcon className="h-5 w-5" />}
          onClick={onAddActivityType}
        />
      </div>
      <DataTableFilters onSearch={setSearch} onResetFilters={onResetFilters}>
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.branch')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onBranchChange}
          selected={branch}
          type={DivisionType.BRANCH}
        />
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.department')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onDepartmentChange}
          selected={department}
          type={DivisionType.DEPARTMENT}
        />
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.role')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onRoleChange}
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
