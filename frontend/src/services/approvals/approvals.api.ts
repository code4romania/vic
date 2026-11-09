import API from '../api';

// #499 / #468: what waits for the NGO's decision
export interface IPendingApprovals {
  accessRequests: number;
  activityLogs: number;
  eventRegistrations: number;
  total: number;
}

export const getPendingApprovals = async (): Promise<IPendingApprovals> => {
  return API.get('/dashboard/pending-approvals').then((res) => res.data);
};
