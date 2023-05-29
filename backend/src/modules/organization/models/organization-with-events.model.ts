import { EventEntity } from 'src/modules/event/entities/event.entity';
import { OrganizationEntity } from '../entities/organization.entity';
import {
  EventModelTransformer,
  IEventModel,
} from 'src/modules/event/models/event.model';
import { OrganizatinVolunteerStatus } from '../enums/organization-volunteer-status.enum';

export interface IOrganizationWithEventsModel {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  activityArea: string;
  logo: string;
  description: string;
  numberOfVolunteers: number;
  events: IEventModel[];
  organizationVolunteerStatus?: OrganizatinVolunteerStatus;
}

export class OrganizationWithEventTransformer {
  static fromEntity(
    organizationEntity: OrganizationEntity & {
      events: EventEntity[];
      numberOfVolunteers: number;
    },
  ): IOrganizationWithEventsModel {
    if (!organizationEntity) return null;
    return {
      id: organizationEntity.id,
      name: organizationEntity.name,
      email: organizationEntity.email,
      phone: organizationEntity.phone,
      address: organizationEntity.address,
      activityArea: organizationEntity.activityArea,
      logo: organizationEntity.logo,
      description: organizationEntity.description,
      numberOfVolunteers: organizationEntity.numberOfVolunteers,
      events: organizationEntity.events.map(EventModelTransformer.fromEntity),
    };
  }
}
