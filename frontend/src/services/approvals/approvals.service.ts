import { useQuery } from 'react-query';
import { getPendingApprovals } from './approvals.api';

export const usePendingApprovalsQuery = () => {
  return useQuery(['pending-approvals'], getPendingApprovals);
};
