import { queryClient } from '../query-client';
import { resetUserState } from '../../store/store';

// After a logout (or a session the backend ended): drop every cached answer and the stores, so the
// next account on this phone never sees the previous one's data, not even for a moment.
export const clearSessionData = (): void => {
  queryClient.cancelQueries();
  queryClient.clear();
  resetUserState();
};
