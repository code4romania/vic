import { IUserProfile } from '../../common/interfaces/user-profile.interface';

export const hasProfileChanged = (
  previous: IUserProfile | null | undefined,
  next: IUserProfile,
): boolean => {
  if (!previous) {
    return true;
  }

  if (
    previous.activeOrganization?.id !== next.activeOrganization?.id ||
    previous.activeOrganization?.volunteerId !== next.activeOrganization?.volunteerId ||
    previous.activeOrganization?.volunteerProfileId !==
      next.activeOrganization?.volunteerProfileId ||
    previous.activeOrganization?.volunteerStatus !== next.activeOrganization?.volunteerStatus ||
    previous.myOrganizations.length !== next.myOrganizations.length
  ) {
    return true;
  }

  const previousOrganizations = new Map(previous.myOrganizations.map((org) => [org.id, org]));
  return next.myOrganizations.some((org) => {
    const old = previousOrganizations.get(org.id);
    return (
      !old ||
      old.volunteerStatus !== org.volunteerStatus ||
      old.volunteerProfileId !== org.volunteerProfileId ||
      old.name !== org.name ||
      old.logo !== org.logo
    );
  });
};
