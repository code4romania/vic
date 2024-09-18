import i18n from '../config/i18n';
import { ClientContractStatus } from '../enums/client-contract-status.enum';
import { IEventListItem } from '../interfaces/event-list-item.interface';
import { IEvent } from '../interfaces/event.interface';
import { IPaginatedEntity } from '../interfaces/paginated-entity.interface';

export const mapPagesToItems = <T>(pages?: IPaginatedEntity<T>[]): T[] => {
  const items: T[] = [];
  pages?.forEach((page) => items.push(...page.items));
  return items;
};

export const mapEventType = (event: IEventListItem | IEvent): string => {
  if (event.isPublic) {
    return i18n.t('event:type.public');
  }

  if (!event.isPublic && !event.targets?.length) {
    return i18n.t('event:type.all_organization');
  }

  return event.targets?.map((target) => target.name).join(', ') || '';
};

export const mapContractStatus = (
  status: ClientContractStatus,
): { label?: string; color: string; backgroundColor: string } | undefined => {
  switch (status) {
    case ClientContractStatus.NOT_STARTED: {
      return {
        label: 'contract_status.not_started',
        color: 'color-info-700',
        backgroundColor: 'color-info-100',
      };
    }
    case ClientContractStatus.ACTIVE: {
      return {
        label: 'contract_status.active',
        color: 'turquoise-500',
        backgroundColor: 'background-turquoise',
      };
    }
    case ClientContractStatus.CLOSED: {
      return {
        label: 'contract_status.closed',
        color: 'gray-50',
        backgroundColor: 'cool-gray-100',
      };
    }
  }
};
