import { useInfiniteQuery, useMutation, useQuery } from 'react-query';
import {
  getOrganization,
  getOrganizations,
  leaveOrganization,
  rejoinOrganization,
  switchOrganization,
} from './organization.api';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import useStore from '../../store/store';
import { IOrganization } from '../../common/interfaces/organization.interface';
import { useAuth } from '../../hooks/useAuth';

export const useOrganizationsInfiniteQuery = (orderDirection: OrderDirection, search: string) => {
  return useInfiniteQuery(
    ['organizations', orderDirection, search],
    ({ pageParam }) => getOrganizations({ pageParam, orderDirection, search }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.meta.totalPages > lastPage?.meta.currentPage
          ? lastPage?.meta.currentPage + 1
          : undefined;
      },
    },
  );
};

export const useOrganizationQuery = (organizationId: string) => {
  const { setOrganization } = useStore();
  return useQuery(['organization', organizationId], () => getOrganization(organizationId), {
    onSuccess: (data: IOrganization) => {
      setOrganization(data);
    },
    enabled: !!organizationId,
    staleTime: 0,
  });
};

export const useSwitchOrganizationMutation = () => {
  return useMutation(['switch-organization'], ({ organizationId }: { organizationId: string }) =>
    switchOrganization(organizationId),
  );
};

export const useLeaveOrganizationMutation = () => {
  const { userProfile, setUserProfile } = useAuth();
  const { setOrganization } = useStore();
  return useMutation(
    ['leave-organization'],
    ({ volunteerId }: { volunteerId: string }) => leaveOrganization(volunteerId),
    {
      onSuccess: (data: IOrganization, { volunteerId }) => {
        // 1. remove it from your organization profile
        const profiles = userProfile?.myOrganizations.filter(
          (org) => org.volunteerId !== volunteerId,
        );
        // 2. check if it is your active organization and if so switch from it
        if (userProfile?.activeOrganization?.id === data.id) {
          setUserProfile({
            ...userProfile,
            myOrganizations: profiles || [],
            activeOrganization: profiles && profiles?.length > 0 ? profiles[0] : null,
          });
        }
        // 3. set your organization profile volunteer status to archived
        setOrganization(data);
      },
    },
  );
};

export const useRejoinOrganizationMutation = () => {
  const { userProfile, setUserProfile } = useAuth();
  const { setOrganization } = useStore();
  return useMutation(
    ['rejoin-organization'],
    ({ volunteerId }: { volunteerId: string }) => rejoinOrganization(volunteerId),
    {
      onSuccess: (data: IOrganization) => {
        const activeOrganization = {
          id: data.id,
          logo: data.logo,
          name: data.name,
          numberOfVolunteer: data.numberOfVolunteers,
          volunteerId: data.volunteer.id,
        };
        // 1. add it to your organization profiles
        const myOrganizations = [...(userProfile?.myOrganizations || []), activeOrganization];
        // 2. set it as your active organization
        setUserProfile({ ...userProfile, myOrganizations, activeOrganization });
        // 3. set your organization profile volunteer status to active
        setOrganization(data);
      },
    },
  );
};
