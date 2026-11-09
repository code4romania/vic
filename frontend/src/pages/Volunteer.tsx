import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import i18n from '../common/config/i18n';
import { InternalErrors } from '../common/errors/internal-errors.class';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import ProfileCard from '../components/ProfileCard';
import { SelectItem } from '../components/Select';
import Tabs from '../components/Tabs';
import VolunteerProfile from '../components/VolunteerProfile';
import { useErrorToast } from '../hooks/useToast';
import { useQueryClient } from 'react-query';
import PageLayout from '../layouts/PageLayout';
import {
  useUpdateVolunteerDetailsMutation,
  useVolunteer,
} from '../services/volunteer/volunteer.service';
import { VolunteerProps } from '../containers/query/VolunteerWithQueryParams';
import VolunteerHoursHistory from '../components/VolunteerHoursHistory';
import ContractsTableWithQueryParams from '../containers/query/ContractsTableWithQueryParams';
import VolunteerActivities from '../components/VolunteerActivities';
import VolunteerEvents from '../components/VolunteerEvents';
import VolunteerStats from '../components/VolunteerStats';

export enum VolunteerTabsOptions {
  ACTIVITIES = 'activities',
  HOURS = 'hours',
  EVENTS = 'events',
  DOCUMENTS = 'documents',
}

const VolunteerTabsOptons: SelectItem<VolunteerTabsOptions>[] = [
  { key: VolunteerTabsOptions.ACTIVITIES, value: i18n.t('volunteer:activities.tab') },
  { key: VolunteerTabsOptions.HOURS, value: i18n.t('volunteer:hours_history.tab') },
  { key: VolunteerTabsOptions.EVENTS, value: i18n.t('volunteer:events.tab') },
  { key: VolunteerTabsOptions.DOCUMENTS, value: i18n.t('side_menu:options.documents') },
];

const Volunteer = ({ query, setQuery }: VolunteerProps) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: volunteer, isLoading, error } = useVolunteer(id as string);
  const queryClient = useQueryClient();
  const { mutate: updateDetails, isLoading: isSavingDetails } = useUpdateVolunteerDetailsMutation();

  const onUpdateDetails = (data: { source?: string | null; isFavorite?: boolean }) => {
    if (!volunteer) return;
    updateDetails(
      { id: volunteer.id, data },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(['volunteer', volunteer.id], updated);
        },
        onError: (detailsError) =>
          useErrorToast(
            InternalErrors.VOLUNTEER_ERRORS.getError(detailsError?.response?.data.code_error),
          ),
      },
    );
  };

  const onTabClick = (tab: VolunteerTabsOptions) => {
    setQuery({ activeTab: tab }, 'replaceIn');
  };

  useEffect(() => {
    if (error) {
      useErrorToast(InternalErrors.VOLUNTEER_ERRORS.getError(error?.response?.data.code_error));
    }
  }, [error]);

  const onBackButtonPress = () => {
    navigate(`/volunteers`, { replace: true });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onBackButtonPress}>{i18n.t('volunteer:title')}</PageHeader>
      {isLoading && <LoadingContent />}
      {volunteer && !isLoading && (
        <div className="w-full flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <ProfileCard
              name={volunteer.user.name}
              age={volunteer.user.age}
              sex={volunteer.user.sex}
              location={volunteer.user.location}
              logo={volunteer.user.profilePicture || ''}
            >
              <VolunteerStats volunteerId={volunteer.id} />
            </ProfileCard>
          </div>
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <VolunteerProfile
              email={volunteer.profile?.email || '-'}
              phone={volunteer.user?.phone || '-'}
              branch={volunteer.profile?.branch?.name}
              status={volunteer.status}
              department={volunteer.profile?.department?.name}
              startedOn={volunteer.profile?.activeSince}
              role={volunteer.profile?.role?.name}
              createdOn={volunteer.createdOn}
              source={volunteer.source}
              notes={volunteer.notes}
              isFavorite={volunteer.isFavorite}
              hasAccount={volunteer.user?.hasAccount}
              onToggleFavorite={() => onUpdateDetails({ isFavorite: !volunteer.isFavorite })}
              onSaveSource={(source) => onUpdateDetails({ source: source || null })}
              isSaving={isSavingDetails}
            />
          </div>
        </div>
      )}
      {!volunteer && !isLoading && (
        <EmptyContent description={i18n.t('general:error.load_entries')} />
      )}
      <Tabs<VolunteerTabsOptions>
        tabs={VolunteerTabsOptons}
        onClick={onTabClick}
        defaultTab={VolunteerTabsOptons.find((option) => option.key === query.activeTab)}
      >
        {query?.activeTab === VolunteerTabsOptions.HOURS && (
          <VolunteerHoursHistory volunteerId={id as string} volunteerStatus={volunteer?.status} />
        )}
        {query?.activeTab === VolunteerTabsOptions.ACTIVITIES && (
          <VolunteerActivities
            volunteerId={id as string}
            volunteerName={volunteer?.user.name}
            volunteerStatus={volunteer?.status}
          />
        )}
        {query?.activeTab === VolunteerTabsOptions.EVENTS && (
          <VolunteerEvents volunteerId={id as string} />
        )}
        {query?.activeTab === VolunteerTabsOptions.DOCUMENTS && (
          <ContractsTableWithQueryParams
            volunteerName={volunteer?.user.name as string}
            volunteerId={volunteer?.id}
          />
        )}
      </Tabs>
    </PageLayout>
  );
};

export default Volunteer;
