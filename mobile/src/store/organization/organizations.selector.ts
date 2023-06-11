import useStore from '../store';

export const useOrganizations = () => {
  const organizations = useStore((state) => state.organizations);
  return { organizations };
};
