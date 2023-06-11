import { IOrganizationStructureItem } from '../../common/interfaces/organization-structure-item.interface';
import API from '../api';

export const getActivityTypesByOrganizationId = async (
  organizationId: string,
): Promise<IOrganizationStructureItem[]> => {
  return API.get(`/mobile/activity-type/${organizationId}`).then((res) => res.data);
};
