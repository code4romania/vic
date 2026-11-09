import { useMemo } from 'react';
import useStore from '../store/store';

export interface IMyOrganization {
  id: string;
  name: string;
  logo?: string;
}

// The organizations the volunteer belongs to (from the profile in the store), e.g. for the
// Organizație chips of the events search.
const useMyOrganizations = (): IMyOrganization[] => {
  const { userProfile } = useStore();
  return useMemo(
    () => (userProfile?.myOrganizations ?? []).map(({ id, name, logo }) => ({ id, name, logo })),
    [userProfile?.myOrganizations],
  );
};

export default useMyOrganizations;
