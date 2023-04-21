// utils
// add mappings and other helper methods

import { ButtonType } from '../enums/button-type.enum';

export const ButtonBackgroundColorMapper = {
  [ButtonType.DANGER]: 'color-danger-500',
  [ButtonType.PRIMARY]: 'color-primary-500',
  [ButtonType.SECONDARY]: 'background-basic-color-1',
};
