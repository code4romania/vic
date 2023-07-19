import useStore from '../store';

export const useUserProfile = () => {
  const userProfile = useStore((state) => state.userProfile);
  return { userProfile };
};
