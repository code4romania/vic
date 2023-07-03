import { IActivityLogCounters } from '../../common/interfaces/activity-log-counters.interface';
import { IActivityLog } from '../../common/interfaces/activity-log.interface';

export const activityLogsSlice = (set: any) => ({
  counters: {
    approved: 0,
    pending: 0,
    rejected: 0,
  },
  selectedActivityLog: undefined,
  setCounters: (counters: IActivityLogCounters) => {
    set({ counters });
  },
  setSelectedActivityLog: (selectedActivityLog: IActivityLog) => {
    set({ selectedActivityLog });
  },
});

export default { activityLogsSlice };
