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
  const { getProfile } = useAuth();
  const { setOrganization } = useStore();
  return useMutation(
    ['leave-organization'],
    ({ volunteerId }: { volunteerId: string }) => leaveOrganization(volunteerId),
    {
      onSuccess: (data: IOrganization) => {
        // 1. remove it from your organization profile
        getProfile();
        // 3. set your organization profile volunteer status to archived
        setOrganization(data);
      },
    },
  );
};

export const useRejoinOrganizationMutation = () => {
  const { getProfile } = useAuth();
  const { setOrganization } = useStore();
  return useMutation(
    ['rejoin-organization'],
    ({ volunteerId }: { volunteerId: string }) => rejoinOrganization(volunteerId),
    {
      onSuccess: (data: IOrganization) => {
        getProfile();
        // 3. set your organization profile volunteer status to active
        setOrganization(data);
      },
    },
  );
};
