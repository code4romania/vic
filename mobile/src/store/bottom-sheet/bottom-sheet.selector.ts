import useStore from '../store';

export const useBottomSheet = () => {
  const isOpen = useStore((state) => state.isOpen);
  return { isOpen };
};
