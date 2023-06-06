import { useMutation, useQuery } from 'react-query';
import {
  createVolunteerProfile,
  getVolunteerProfile,
  joinByAccessCode,
  updateVolunteerProfile,
} from './volunteer.api';
import useStore from '../../store/store';
import { IVolunteer } from '../../common/interfaces/volunteer.interface';

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
  const { setVolunteer } = useStore();
  return useQuery(
    ['volunteer-profile', organizationId],
    () => getVolunteerProfile(organizationId),
    { onSuccess: (data: IVolunteer) => setVolunteer(data), enabled: !!organizationId },
  );
};

export const useCreateVolunteerProfileMutation = () => {
  return useMutation(
    ['create-volunteer-profile'],
    ({ profile, volunteerId }: { profile: ICreateVolunteerProfilePayload; volunteerId: string }) =>
      createVolunteerProfile(volunteerId, profile),
  );
};

export const useUpdateVolunteerProfileMutation = () => {
  const { setVolunteer } = useStore();
  return useMutation(
    ['update-volunteer-profile'],
    ({ profile, volunteerId }: { profile: ICreateVolunteerProfilePayload; volunteerId: string }) =>
      updateVolunteerProfile(volunteerId, profile),
    { onSuccess: (data: IVolunteer) => setVolunteer(data) },
  );
};
