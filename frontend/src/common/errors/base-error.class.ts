import i18n from '../config/i18n';

// Codes any page can receive, whatever its own error class: ORG_005 comes from creating events,
// publishing them, logging or approving hours while the organization is not validated (decision 1).
const SHARED_ERRORS: Record<string, string> = {
  ORG_005: 'organization:errors.ORG_005',
};

export abstract class ErrorClass<T extends number | string | symbol> {
  constructor(private errors: Record<T, string>) {}

  public getError(code?: T): string {
    if (!code) {
      return i18n.t('general:error.unknown');
    }

    const shared = SHARED_ERRORS[String(code)];
    return (
      this.errors[code] ||
      (shared ? i18n.t(shared) : i18n.t('general:error.generic_error', { code }))
    );
  }
}
