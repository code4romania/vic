import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import i18n from '../common/config/i18n';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';
import AddHoursModal from './AddHoursModal';
import { VolunteerLogsTable } from './VolunteerActivities';

interface VolunteerHoursHistoryProps {
  volunteerId: string;
  volunteerStatus?: VolunteerStatus;
}

// VIC 2.0 (#482): one hours history with event and activity hours in every status (it replaces the
// "pending" and "past" tabs). Pending entries are approved or rejected from the side panel.
// #483: "Add hours" opens a modal; the button shows only for an Active volunteer.
const VolunteerHoursHistory = ({ volunteerId, volunteerStatus }: VolunteerHoursHistoryProps) => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const onCloseModal = (saved?: boolean) => {
    setIsAdding(false);
    if (saved) {
      queryClient.invalidateQueries(['activity-logs']);
      queryClient.invalidateQueries(['volunteer', volunteerId]);
    }
  };

  return (
    <>
      <VolunteerLogsTable
        volunteerId={volunteerId}
        title={i18n.t('volunteer:hours_history.title')}
        description={i18n.t('volunteer:hours_history.description')}
        addLabel={i18n.t('volunteer:add_hours.title')}
        canAdd={volunteerStatus === VolunteerStatus.ACTIVE}
        onAdd={() => setIsAdding(true)}
      />
      {isAdding && <AddHoursModal volunteerId={volunteerId} onClose={onCloseModal} />}
    </>
  );
};

export default VolunteerHoursHistory;
