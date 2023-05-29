import API from '../api';
import { ICreateAccessRequestPayload } from './access-request.service';

export const createAccessRequest = async (request: ICreateAccessRequestPayload): Promise<any> => {
  return API.post('/mobile/access-request', request).then((res) => res.data);
};
