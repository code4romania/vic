import useStore from '../store';

export const useActivityLogs = () => {
  const approvedHours = useStore((state) => state.counters.approved);
  const rejectedHours = useStore((state) => state.counters.rejected);
  const pendingHours = useStore((state) => state.counters.pending);
  const selectedActivityLog = useStore((state) => state.selectedActivityLog);
  return { approvedHours, rejectedHours, pendingHours, selectedActivityLog };
};
