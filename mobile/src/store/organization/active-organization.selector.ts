import useStore from '../store';

export const useActiveOrganization = () => {
  const activeOrganization = useStore((state) => state.activeOrganization);
  return { activeOrganization };
};
