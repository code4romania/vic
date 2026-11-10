import i18n from '../config/i18n';

// Codes any page can receive, whatever its own error class: ORG_005 comes from creating events,
// publishing them, logging or approving hours while the organization is not validated (decision 1).
const SHARED_ERRORS: Record<string, string> = {
  ORG_005: 'organization:errors.ORG_005',
  ORG_012: 'organization:errors.ORG_012',
  ORG_013: 'organization:errors.ORG_013',
  // the server's generic codes, from any request
  INVALID_ORDER_BY: 'general:error.codes.INVALID_ORDER_BY',
  FILE_TOO_LARGE: 'general:error.codes.FILE_TOO_LARGE',
  DUPLICATE_ENTRY: 'general:error.codes.DUPLICATE_ENTRY',
  INTERNAL_ERROR: 'general:error.codes.INTERNAL_ERROR',
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
