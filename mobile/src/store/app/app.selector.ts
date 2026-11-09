import useStore from '../store';

export const useAppState = () => {
  const maintenance = useStore((state) => state.maintenance);
  const updateRequired = useStore((state) => state.updateRequired);
  const setMaintenance = useStore((state) => state.setMaintenance);
  return { maintenance, updateRequired, setMaintenance };
};
