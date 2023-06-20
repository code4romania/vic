import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum ContractExceptionCodes {
  CONTRACT_001 = 'CONTRACT_001',
  CONTRACT_002 = 'CONTRACT_002',
  CONTRACT_003 = 'CONTRACT_003',
}

type ContractExceptionCodeType = keyof typeof ContractExceptionCodes;

export const ContractExceptionMessages: Record<
  ContractExceptionCodes,
  BusinessException<ContractExceptionCodeType>
> = {
  [ContractExceptionCodes.CONTRACT_001]: {
    code_error: ContractExceptionCodes.CONTRACT_001,
    message: 'Error while uploading the Contract to s3',
  },
  [ContractExceptionCodes.CONTRACT_002]: {
    code_error: ContractExceptionCodes.CONTRACT_002,
    message: 'Contract not found!',
  },
  [ContractExceptionCodes.CONTRACT_003]: {
    code_error: ContractExceptionCodes.CONTRACT_003,
    message: 'Could not delete the contract file from s3!',
  },
};
