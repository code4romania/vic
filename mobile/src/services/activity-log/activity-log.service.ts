import { useMutation } from 'react-query';
import { createActivityLog } from './activity-log.api';
import { ActivityLogFormTypes } from '../../screens/AddActivityLog';

export const useCreateActivityLogMutation = () => {
  return useMutation(['log-hours'], ({ activityLog }: { activityLog: ActivityLogFormTypes }) =>
    createActivityLog(activityLog),
  );
};
