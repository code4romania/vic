// Set by the API client: 426 → this build is below the backend's MOBILE_MIN_VERSION (the own-auth
// backend answers AUTH_011). The Router then shows the UpdateRequired screen instead of the routes.
export const appSlice = (set: any) => ({
  updateRequired: false,
  setUpdateRequired: (updateRequired: boolean) => {
    set({ updateRequired });
  },
});

export default { appSlice };
