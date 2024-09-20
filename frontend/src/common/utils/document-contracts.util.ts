export const mapErrorCodeToTranslationKey = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    CONTRACT_010: 'doc_templates:errors.invalid_input_data',
    CONTRACT_004: 'doc_templates:errors.contract_number_exists',
    CONTRACT_005: 'doc_templates:errors.volunteer_has_contract',
    CONTRACT_013: 'doc_templates:errors.missing_volunteer_data',
    CONTRACT_012: 'doc_templates:errors.invalid_personal_data',
    CONTRACT_008: 'doc_templates:errors.legal_guardian_required',
    CONTRACT_011: 'doc_templates:errors.invalid_legal_guardian_data',
    CONTRACT_009: 'doc_templates:errors.db_error',
  };

  return errorMap[errorCode] || 'doc_templates:errors.unknown_error';
};
