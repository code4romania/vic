import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum CONTRACT_ERRORS {
  CONTRACT_001 = 'CONTRACT_001',
}

export class ContractError extends ErrorClass<CONTRACT_ERRORS> {
  private static instance: ContractError;

  private constructor() {
    super({
      [CONTRACT_ERRORS.CONTRACT_001]: i18n.t('volunteers:errors.VOLUNTEER_001'),
    });
  }

  public static getInstance(): ContractError {
    if (!ContractError.instance) {
      ContractError.instance = new ContractError();
    }

    return ContractError.instance;
  }
}
