import { IVolunteer } from '../../common/interfaces/volunteer.interface';
import API from '../api';
import { ICreateVolunteerProfilePayload, IJoinByAccessCodePayload } from './volunteer.service';

export const joinByAccessCode = async (request: IJoinByAccessCodePayload): Promise<IVolunteer> => {
  return API.post('/mobile/volunteer/access-code', request).then((res) => res.data);
};

export const createVolunteerProfile = async (
  volunteerId: string,
  profile: ICreateVolunteerProfilePayload,
): Promise<IVolunteer> => {
  return API.post(`/mobile/volunteer/${volunteerId}/profile`, profile).then((res) => res.data);
};
