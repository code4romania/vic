import { useMutation, useQuery } from 'react-query';
import { createVolunteerProfile, getVolunteerProfile, joinByAccessCode } from './volunteer.api';

export interface IJoinByAccessCodePayload {
  code: string;
  organizationId: string;
}

export interface ICreateVolunteerProfilePayload {
  email: string;
  phone: string;
  activeSince?: Date;
  branchId?: string;
  departmentId?: string;
  roleId?: string;
}

export const useJoinByAccessCodeMutation = () => {
  return useMutation(['join-by-access-code'], (request: IJoinByAccessCodePayload) =>
    joinByAccessCode(request),
  );
};

export const useVolunteerProfile = (organizationId: string) => {
  return useQuery(
    ['volunteer-profile', organizationId],
    () => getVolunteerProfile(organizationId),
    { enabled: !!organizationId },
  );
};

export const useCreateVolunteerProfileMutation = () => {
  return useMutation(
    ['create-volunteer-profile'],
    ({ profile, volunteerId }: { profile: ICreateVolunteerProfilePayload; volunteerId: string }) =>
      createVolunteerProfile(volunteerId, profile),
  );
};
