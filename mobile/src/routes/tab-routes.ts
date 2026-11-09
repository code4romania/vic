// Route names of the five tabs (VIC 2.0 floating tab bar). Screens that also exist in the stack,
// such as ActivityLogs and Documents, use this to hide the back button when shown as a tab.
export const TAB_ROUTES = {
  HOME: 'dashboard',
  EVENTS: 'events',
  HOURS: 'hours',
  DOCUMENTS: 'docs',
  PROFILE: 'profile',
} as const;

export const isTabRoute = (route?: { name?: string }) =>
  !!route?.name && (Object.values(TAB_ROUTES) as string[]).includes(route.name);

// Routes of the tab navigator without a button in the bar.
export const HIDDEN_TAB_ROUTES = {
  VOLUNTEER: 'volunteer',
  ORGANIZATIONS: 'search',
} as const;
