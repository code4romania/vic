import useStore from '../store';

export const useVolunteer = () => {
  const volunteer = useStore((state) => state.volunteer);
  return { volunteer };
};
