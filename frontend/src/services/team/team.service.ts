import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ORGANIZATION_ERRORS } from '../../common/errors/entities/organization.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import { IAddAdmin } from '../../common/interfaces/team.interface';
import { addAdmin, getTeam, sendInvite, setAdminStatus } from './team.api';

export type TeamApiError = AxiosError<IBusinessException<ORGANIZATION_ERRORS>>;

export const useTeamQuery = () =>
  useQuery(['team'], () => getTeam(), { onError: (error: TeamApiError) => error });

// Every Team change refetches the table.
const useTeamMutation = <T, R>(fn: (variables: T) => Promise<R>) => {
  const queryClient = useQueryClient();
  return useMutation(fn, {
    onSuccess: () => queryClient.invalidateQueries(['team']),
    onError: (error: TeamApiError) => Promise.resolve(error),
  });
};

export const useAddAdminMutation = () => useTeamMutation((data: IAddAdmin) => addAdmin(data));

export const useSendInviteMutation = () => useTeamMutation((userId: string) => sendInvite(userId));

export const useSetAdminStatusMutation = () =>
  useTeamMutation(({ userId, enabled }: { userId: string; enabled: boolean }) =>
    setAdminStatus(userId, enabled),
  );
