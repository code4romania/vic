import useStore from '../store';

export const useAppState = () => {
  const updateRequired = useStore((state) => state.updateRequired);
  return { updateRequired };
};
