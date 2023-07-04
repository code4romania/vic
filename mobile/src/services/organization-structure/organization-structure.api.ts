import { OrganizationStructureType } from '../../common/enums/organization-structure-type.enum';
import { IOrganizationStructureItem } from '../../common/interfaces/organization-structure-item.interface';
import API from '../api';

export const getOrganizationStructuresByType = (
  type: OrganizationStructureType,
  organizationId: string,
): Promise<IOrganizationStructureItem[]> => {
  return API.get(`/mobile/organization-structure/${type}/organization/${organizationId}`).then(
    (res) => res.data,
  );
};
