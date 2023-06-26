import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum CONTRACT_ERRORS {
  CONTRACT_002 = 'CONTRACT_002',
  CONTRACT_001 = 'CONTRACT_001',
}

export class ContractErrors extends ErrorClass<CONTRACT_ERRORS> {
  private static instance: ContractErrors;

  private constructor() {
    super({
      [CONTRACT_ERRORS.CONTRACT_001]: i18n.t('documents:contract.errors.CONTRACT_001'),
      [CONTRACT_ERRORS.CONTRACT_002]: i18n.t('documents:contract.errors.CONTRACT_002'),
    });
  }

  public static getInstance(): ContractErrors {
    if (!ContractErrors.instance) {
      ContractErrors.instance = new ContractErrors();
    }

    return ContractErrors.instance;
  }
}
