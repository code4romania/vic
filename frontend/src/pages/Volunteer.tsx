import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import i18n from '../common/config/i18n';
import { ActivityLogResolutionStatus } from '../common/enums/activity-log-resolution-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import ActivityLogTable from '../components/ActivityLogTable';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import ProfileCard from '../components/ProfileCard';
import { SelectItem } from '../components/Select';
import Tabs from '../components/Tabs';
import VolunteerProfile from '../components/VolunteerProfile';
import { useErrorToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import { useVolunteer } from '../services/volunteer/volunteer.service';

enum TabsOptions {
  ARCHIVE = 'archive',
  NEW = 'new',
  SOLVED = 'solved',
}

const VolunteerTabsOptons: SelectItem<TabsOptions>[] = [
  { key: TabsOptions.ARCHIVE, value: i18n.t('side_menu:options.actions_archive') },
  { key: TabsOptions.NEW, value: i18n.t('activity_log:pending') },
  { key: TabsOptions.SOLVED, value: i18n.t('activity_log:past') },
];

const Volunteer = () => {
  const [activeTab, setActiveTab] = useState<TabsOptions>(TabsOptions.ARCHIVE);
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: volunteer, isLoading, error } = useVolunteer(id as string);

  useEffect(() => {
    if (error) {
      useErrorToast(InternalErrors.VOLUNTEER_ERRORS.getError(error?.response?.data.code_error));
    }
  }, [error]);

  const onBackButtonPress = () => {
    navigate('/volunteers', { replace: true });
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
              birthday={volunteer.user.birthday}
              sex={volunteer.user.sex}
              location={volunteer.user.location}
              logo={volunteer.user.profilePicture || ''}
            />
          </div>
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <VolunteerProfile
              email={volunteer.profile?.email || '-'}
              phone={volunteer.profile?.phone || '-'}
              branch={volunteer.profile?.branch?.name}
              status={volunteer.status}
              department={volunteer.profile?.department?.name}
              startedOn={volunteer.profile?.activeSince}
              role={volunteer.profile?.role?.name}
              createdOn={volunteer.createdOn}
            />
          </div>
        </div>
      )}
      {!volunteer && !isLoading && (
        <EmptyContent description={i18n.t('general:error.load_entries')} />
      )}
      <Tabs<TabsOptions> tabs={VolunteerTabsOptons} onClick={setActiveTab}>
        {activeTab === TabsOptions.NEW && (
          <ActivityLogTable
            resolutionStatus={ActivityLogResolutionStatus.NEW}
            volunteerId={id as string}
          />
        )}
        {activeTab === TabsOptions.SOLVED && (
          <ActivityLogTable
            resolutionStatus={ActivityLogResolutionStatus.SOLVED}
            volunteerId={id as string}
          />
        )}
        {activeTab === TabsOptions.ARCHIVE && <div>Actions Archive to be added</div>}
      </Tabs>
    </PageLayout>
  );
};

export default Volunteer;
