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
  CONTRACT_008 = 'CONTRACT_008',
  CONTRACT_009 = 'CONTRACT_009',
  VOLUNTEER_007 = 'VOLUNTEER_007',
}

export class ContractError extends ErrorClass<CONTRACT_ERRORS> {
  private static instance: ContractError;

  private constructor() {
    super({
      [CONTRACT_ERRORS.ORG_001]: 'organization:errors.ORG_001',
      [CONTRACT_ERRORS.VOLUNTEER_001]: 'volunteers:errors.VOLUNTEER_001',
      [CONTRACT_ERRORS.TEMPLATE_002]: 'documents:template.edit.form.submit.errors.TEMPLATE_002',
      [CONTRACT_ERRORS.CONTRACT_004]: 'documents:contract.add.submit.errors.CONTRACT_004',
      [CONTRACT_ERRORS.CONTRACT_005]: 'documents:contract.add.submit.errors.CONTRACT_005',
      [CONTRACT_ERRORS.CONTRACT_002]: 'documents:contract.submit.errors.CONTRACT_002',
      [CONTRACT_ERRORS.CONTRACT_001]: 'documents:contract.submit.errors.CONTRACT_001',
      [CONTRACT_ERRORS.CONTRACT_003]: 'documents:contract.submit.errors.CONTRACT_003',
      [CONTRACT_ERRORS.CONTRACT_006]: 'documents:contract.submit.errors.CONTRACT_006',
      [CONTRACT_ERRORS.CONTRACT_008]: 'documents:contract.submit.errors.CONTRACT_008',
      [CONTRACT_ERRORS.CONTRACT_009]: 'documents:contract.submit.errors.CONTRACT_009',
      [CONTRACT_ERRORS.VOLUNTEER_007]: 'documents:contract.submit.errors.VOLUNTEER_007',
    });
  }

  public static getInstance(): ContractError {
    if (!ContractError.instance) {
      ContractError.instance = new ContractError();
    }

    return ContractError.instance;
  }
}
