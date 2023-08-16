import { IRejectedAccessRequest } from '../../common/interfaces/rejected-acess-request.interface';
import API from '../api';
import { ICreateAccessRequestPayload } from './access-request.service';

export const createAccessRequest = async (request: ICreateAccessRequestPayload): Promise<any> => {
  return API.post('/mobile/access-request', request).then((res) => res.data);
};

export const cancelAccessRequest = async (organizationId: string): Promise<void> => {
  return API.delete(`/mobile/access-request/${organizationId}/cancel`).then((res) => res.data);
};

export const getRejectedAccessRequest = async (
  accessRequestId: string,
): Promise<IRejectedAccessRequest> => {
  return API.get(`mobile/access-request/${accessRequestId}`).then((res) => res.data);
};
