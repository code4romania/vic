import { IMaskedEmail } from '../../common/interfaces/organization.interface';
import { IAddAdmin, ITeamMember } from '../../common/interfaces/team.interface';
import API from '../api';

export const getTeam = async (): Promise<ITeamMember[]> =>
  API.get('/organization/team').then((res) => res.data);

// Creates the admin and emails an invite.
export const addAdmin = async (data: IAddAdmin): Promise<IMaskedEmail> =>
  API.post('/organization/team', data).then((res) => res.data);

// Only for admins without a password (ORG_009 otherwise).
export const sendInvite = async (userId: string): Promise<IMaskedEmail> =>
  API.post(`/organization/team/${userId}/invite`).then((res) => res.data);

// Enable sends no email (R20).
export const setAdminStatus = async (userId: string, enabled: boolean): Promise<void> => {
  await API.patch(`/organization/team/${userId}/${enabled ? 'enable' : 'disable'}`);
};
