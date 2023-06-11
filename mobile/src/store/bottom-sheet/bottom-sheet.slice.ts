export const bottomSheetSlice = (set: any) => ({
  isOpen: false,
  open: () => {
    set({ isOpen: true });
  },
  close: () => {
    set({ isOpen: false });
  },
});

export default { bottomSheetSlice };
