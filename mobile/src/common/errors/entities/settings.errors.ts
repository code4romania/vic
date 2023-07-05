import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum SETTINGS_ERRORS {
  NOTIFICATIONS_002 = 'NOTIFICATIONS_002',
}

export class SettingsErrors extends ErrorClass<SETTINGS_ERRORS> {
  private static instance: SettingsErrors;

  private constructor() {
    super({
      [SETTINGS_ERRORS.NOTIFICATIONS_002]: i18n.t('notifications:errors.NOTIFICATIONS_002'),
    });
  }

  public static getInstance(): SettingsErrors {
    if (!SettingsErrors.instance) {
      SettingsErrors.instance = new SettingsErrors();
    }

    return SettingsErrors.instance;
  }
}
