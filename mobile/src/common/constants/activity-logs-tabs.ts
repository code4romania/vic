import { ISelectItem } from '../../components/FormSelect';
import i18n from '../config/i18n';
import { ActivityLogStatus } from '../enums/activity-log.status.enum';

export const ActivityLogsTabs: ISelectItem[] = [
  { key: ActivityLogStatus.PENDING, label: i18n.t('activity_log:pending') },
  { key: ActivityLogStatus.APPROVED, label: i18n.t('activity_log:approved') },
  { key: ActivityLogStatus.REJECTED, label: i18n.t('activity_log:rejected') },
];
