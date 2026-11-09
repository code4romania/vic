// Until EXPO_PUBLIC_MIGRATION_NOTICE_UNTIL (YYYY-MM-DD, inclusive) Login tells volunteers from the
// old app to use the emailed link or Forgot password: they have no password in the new system yet.
export const isMigrationNoticeActive = (now: Date = new Date()): boolean => {
  const until = process.env.EXPO_PUBLIC_MIGRATION_NOTICE_UNTIL;
  if (!until) {
    return false;
  }
  const end = new Date(`${until}T23:59:59`);
  return !Number.isNaN(end.getTime()) && now <= end;
};
