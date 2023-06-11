import useStore from '../store';

export const useEvent = () => {
  const event = useStore((state) => state.event);
  return { event };
};
