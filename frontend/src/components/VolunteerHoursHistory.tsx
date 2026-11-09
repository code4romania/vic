import React from 'react';
import { useNavigate } from 'react-router';
import i18n from '../common/config/i18n';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';
import { VolunteerLogsTable } from './VolunteerActivities';

interface VolunteerHoursHistoryProps {
  volunteerId: string;
  volunteerName?: string;
  volunteerStatus?: VolunteerStatus;
}

// VIC 2.0 (#482): one hours history with event and activity hours in every status (it replaces the
// "pending" and "past" tabs). Pending entries are approved or rejected from the side panel.
const VolunteerHoursHistory = ({
  volunteerId,
  volunteerName,
  volunteerStatus,
}: VolunteerHoursHistoryProps) => {
  const navigate = useNavigate();

  const onAdd = () => {
    const search = new URLSearchParams({ volunteerId, volunteerName: volunteerName ?? '' });
    navigate(`/activity-log/add?${search.toString()}`);
  };

  return (
    <VolunteerLogsTable
      volunteerId={volunteerId}
      title={i18n.t('volunteer:hours_history.title')}
      description={i18n.t('volunteer:hours_history.description')}
      addLabel={i18n.t('activity_log:add')}
      canAdd={volunteerStatus === VolunteerStatus.ACTIVE}
      onAdd={onAdd}
    />
  );
};

export default VolunteerHoursHistory;
