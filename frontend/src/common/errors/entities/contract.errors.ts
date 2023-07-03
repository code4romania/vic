import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum CONTRACT_ERRORS {
  ORG_001 = 'ORG_001',
  VOLUNTEER_001 = 'VOLUNTEER_001',
  TEMPLATE_002 = 'TEMPLATE_002',
  CONTRACT_004 = 'CONTRACT_004',
  CONTRACT_005 = 'CONTRACT_005',
  CONTRACT_002 = 'CONTRACT_002',
  CONTRACT_001 = 'CONTRACT_001',
  CONTRACT_003 = 'CONTRACT_003',
  CONTRACT_006 = 'CONTRACT_006',
}

export class ContractError extends ErrorClass<CONTRACT_ERRORS> {
  private static instance: ContractError;

  private constructor() {
    super({
      [CONTRACT_ERRORS.ORG_001]: i18n.t('organization:errors.ORG_001'),
      [CONTRACT_ERRORS.VOLUNTEER_001]: i18n.t('volunteers:errors.VOLUNTEER_001'),
      [CONTRACT_ERRORS.TEMPLATE_002]: i18n.t(
        'documents:template.edit.form.submit.errors.TEMPLATE_002',
      ),
      [CONTRACT_ERRORS.CONTRACT_004]: i18n.t('documents:contract.add.submit.errors.CONTRACT_004'),
      [CONTRACT_ERRORS.CONTRACT_005]: i18n.t('documents:contract.add.submit.errors.CONTRACT_005'),
      [CONTRACT_ERRORS.CONTRACT_002]: i18n.t('documents:contract.submit.errors.CONTRACT_002'),
      [CONTRACT_ERRORS.CONTRACT_001]: i18n.t('documents:contract.submit.errors.CONTRACT_001'),
      [CONTRACT_ERRORS.CONTRACT_003]: i18n.t('documents:contract.submit.errors.CONTRACT_003'),
      [CONTRACT_ERRORS.CONTRACT_006]: i18n.t('documents:contract.submit.errors.CONTRACT_006'),
    });
  }

  public static getInstance(): ContractError {
    if (!ContractError.instance) {
      ContractError.instance = new ContractError();
    }

    return ContractError.instance;
  }
}
