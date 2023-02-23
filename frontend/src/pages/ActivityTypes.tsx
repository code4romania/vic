import React, { useEffect } from 'react';
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

const ActivityTypes = () => {
  // navigation
  const navigate = useNavigate();

  // data fetching
  const {
    data: activityTypes,
    error: activityTypesError,
    isLoading: isFetchingActivityTypes,
  } = useActivityTypesQuery();

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
          </CardBody>
        </Card>
      )}
      {!activityTypes && !isFetchingActivityTypes && (
        <EmptyContent description={i18n.t('general:error.load_entries')} />
      )}
    </PageLayout>
  );
};

export default ActivityTypes;