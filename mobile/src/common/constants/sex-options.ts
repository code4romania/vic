import { ISelectItem } from '../../components/FormSelect';
import i18n from '../config/i18n';
import { Sex } from '../enums/sex.enum';

// A function, not a constant: the labels follow the language the app is in when the list is drawn.
export const getSexOptions = (): ISelectItem[] => [
  { key: Sex.MALE, label: i18n.t('general:male') },
  { key: Sex.FEMALE, label: i18n.t('general:female') },
  { key: Sex.NON_BINARY, label: i18n.t('general:non_binary') },
  { key: Sex.UNDISCLOSED, label: i18n.t('general:undisclosed') },
];
