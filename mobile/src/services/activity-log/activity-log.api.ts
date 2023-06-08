import { IOrganizationStructureItem } from '../../common/interfaces/organization-structure-item.interface';
import { ActivityLogFormTypes } from '../../screens/AddActivityLog';
import API from '../api';

export const createActivityLog = async (
  payload: ActivityLogFormTypes,
): Promise<IOrganizationStructureItem[]> => {
  return API.post('/mobile/activity-log', payload).then((res) => res.data);
};
