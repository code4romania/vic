import i18n from '../config/i18n';

export abstract class ErrorClass<T extends number | string | symbol> {
  constructor(private errors: Record<T, string>) {}

  public getError(code?: T): string {
    if (!code) {
      return i18n.t('general:error.unknown');
    }

    return this.errors[code] || i18n.t('general:error.generic_error', { code });
  }
}
