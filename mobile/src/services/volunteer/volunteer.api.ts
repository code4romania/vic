import { IVolunteer } from '../../common/interfaces/volunteer.interface';
import API from '../api';
import { IJoinByAccessCodePayload } from './volunteer.service';

export const joinByAccessCode = async (request: IJoinByAccessCodePayload): Promise<IVolunteer> => {
  return API.post('/mobile/volunteer/access-code', request).then((res) => res.data);
};
