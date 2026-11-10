import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ORGANIZATION_ERRORS } from '../../common/errors/entities/organization.errors';
import { IBusinessException } from '../../common/interfaces/business-exception.interface';
import {
  getPendingValidation,
  suspendOrganization,
  unsuspendOrganization,
  validateOrganization,
} from './admin-organizations.api';

type AdminApiError = AxiosError<IBusinessException<ORGANIZATION_ERRORS>>;

export const usePendingValidationQuery = (enabled: boolean) =>
  useQuery(['pending-validation'], () => getPendingValidation(), {
    enabled,
    onError: (error: AdminApiError) => error,
  });

const usePendingMutation = (fn: (id: string) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation(fn, {
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-validation']);
      // the "Toate organizațiile" list and the counters on the validation page
      queryClient.invalidateQueries(['admin-organizations']);
      // The super admin's own organization may be the one validated (the banner reads it).
      queryClient.invalidateQueries(['organization']);
    },
    onError: (error: AdminApiError) => Promise.resolve(error),
  });
};

export const useValidateOrganizationMutation = () => usePendingMutation(validateOrganization);
export const useSuspendOrganizationMutation = () => usePendingMutation(suspendOrganization);
export const useUnsuspendOrganizationMutation = () => usePendingMutation(unsuspendOrganization);
