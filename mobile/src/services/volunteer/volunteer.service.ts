import { useMutation, useQuery } from 'react-query';
import {
  createVolunteerProfile,
  getVolunteerProfile,
  getVolunteerStats,
  joinByAccessCode,
  updateVolunteerProfile,
} from './volunteer.api';
import useStore from '../../store/store';
import { IVolunteer } from '../../common/interfaces/volunteer.interface';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../store/organization/organization.selector';
import { OrganizatinVolunteerStatus } from '../../common/enums/organization-volunteer-status.enum';
import { IOrganization } from '../../common/interfaces/organization.interface';

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
  const { userProfile, setUserProfile } = useAuth();
  const { organization } = useOrganization();
  const { setOrganization } = useStore();
  return useMutation(
    ['join-by-access-code'],
    (request: IJoinByAccessCodePayload) => joinByAccessCode(request),
    {
      onSuccess: (data: IVolunteer) => {
        // update user profile context
        setUserProfile({
          ...userProfile,
          activeOrganization: {
            ...data.organization,
            volunteerId: data.id,
          },
          myOrganizations: [
            ...(userProfile?.myOrganizations || []),
            {
              ...data.organization,
              volunteerId: data.id,
            },
          ],
        });
        // update organization state in the previous screen
        setOrganization({
          ...(organization as IOrganization),
          organizationVolunteerStatus: OrganizatinVolunteerStatus.ACTIVE_VOLUNTEER,
          volunteer: data,
        });
      },
    },
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

export const useVolunteerStats = (volunteerId: string) => {
  return useQuery(['volunteer-stats', volunteerId], () => getVolunteerStats(volunteerId), {
    enabled: !!volunteerId,
  });
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
