import { ISelectItem } from '../../components/FormSelect';
import i18n from '../config/i18n';
import { REFERRAL } from '../enums/refferal.enum';

export const ReferralOptions: ISelectItem[] = [
  { key: REFERRAL.SOCIAL, label: i18n.t('join_ngo:form.referral.social') },
  { key: REFERRAL.VIC, label: i18n.t('join_ngo:form.referral.vic') },
  { key: REFERRAL.FRIEND, label: i18n.t('join_ngo:form.referral.friend') },
  { key: REFERRAL.EVENT, label: i18n.t('join_ngo:form.referral.event') },
  { key: REFERRAL.OTHER, label: i18n.t('join_ngo:form.referral.other') },
];
