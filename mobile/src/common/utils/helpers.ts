import i18n from '../config/i18n';
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
