import useStore from '../store';

export const useOrganization = () => {
  const organization = useStore((state) => state.organization);
  return { organization };
};
