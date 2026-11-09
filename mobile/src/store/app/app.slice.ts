// Set by the API client: 503 → maintenance (the cutover window), 426 → this build is below
// MOBILE_MIN_VERSION. The Router shows the Maintenance / UpdateRequired screens from these.
export const appSlice = (set: any) => ({
  maintenance: false,
  updateRequired: false,
  setMaintenance: (maintenance: boolean) => {
    set({ maintenance });
  },
  setUpdateRequired: (updateRequired: boolean) => {
    set({ updateRequired });
  },
});

export default { appSlice };
