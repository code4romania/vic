import { IActivityLogCounters } from '../../common/interfaces/activity-log-counters.interface';

export const activityLogsSlice = (set: any) => ({
  counters: {
    approved: 0,
    pending: 0,
    rejected: 0,
  },
  setCounters: (counters: IActivityLogCounters) => {
    set({ counters });
  },
});

export default { activityLogsSlice };
