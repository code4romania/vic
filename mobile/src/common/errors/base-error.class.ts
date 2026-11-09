import i18n from '../config/i18n';

// Codes any screen can receive, whatever its own error class: the backend refuses joining, events and
// hour logging for an NGO that is not validated or is suspended (ORG_005).
const SHARED_ERRORS: Record<string, string> = {
  ORG_005: 'general:error.ORG_005',
};

export abstract class ErrorClass<T extends number | string | symbol> {
  constructor(private errors: Record<T, string>) {}

  public getError(code?: T): string {
    if (!code) {
      return i18n.t('general:error.unknown');
    }

    if (this.errors[code]) {
      return this.errors[code];
    }

    const shared = SHARED_ERRORS[code as string];
    return shared ? i18n.t(shared) : i18n.t('general:error.generic_error', { code });
  }
}
