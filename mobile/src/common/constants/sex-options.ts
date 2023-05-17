import { ISelectItem } from '../../components/FormSelect';
import i18n from '../config/i18n';
import { Sex } from '../enums/sex.enum';

export const SexOptions: ISelectItem[] = [
  { key: Sex.MALE, label: i18n.t('general:male') },
  { key: Sex.FEMALE, label: i18n.t('general:female') },
];
