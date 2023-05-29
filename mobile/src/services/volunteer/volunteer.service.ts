import { useMutation } from 'react-query';
import { joinByAccessCode } from './volunteer.api';

export interface IJoinByAccessCodePayload {
  code: string;
  organizationId: string;
}

export const useJoinByAccessCodeMutation = () => {
  return useMutation(['join-by-access-code'], (request: IJoinByAccessCodePayload) =>
    joinByAccessCode(request),
  );
};
