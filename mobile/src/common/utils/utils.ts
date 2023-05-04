// utils
// add mappings and other helper methods

export const applyCardShadow = (theme: any) => ({
  shadowColor: theme['cool-gray-400'],
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2, // android only
});
