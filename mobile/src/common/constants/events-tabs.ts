import { ISelectItem } from '../../components/FormSelect';
import i18n from '../config/i18n';
import { EventType } from '../enums/event-type.enum';

export const EventsTabs: ISelectItem[] = [
  { key: EventType.GOING, label: i18n.t('event:tabs.going') },
  { key: EventType.MYNGOS, label: i18n.t('event:tabs.from_my_ngos') },
  { key: EventType.OPEN, label: i18n.t('event:tabs.open') },
];
