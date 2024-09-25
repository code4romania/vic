import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum ContractExceptionCodes {
  CONTRACT_001 = 'CONTRACT_001',
  CONTRACT_002 = 'CONTRACT_002',
  CONTRACT_003 = 'CONTRACT_003',
  CONTRACT_004 = 'CONTRACT_004',
  CONTRACT_005 = 'CONTRACT_005',
  CONTRACT_006 = 'CONTRACT_006',
  CONTRACT_007 = 'CONTRACT_007',
  CONTRACT_008 = 'CONTRACT_008',
  CONTRACT_009 = 'CONTRACT_009',
  CONTRACT_010 = 'CONTRACT_010',
  CONTRACT_011 = 'CONTRACT_011',
  CONTRACT_012 = 'CONTRACT_012',
  CONTRACT_013 = 'CONTRACT_013',
  CONTRACT_014 = 'CONTRACT_014',
  CONTRACT_015 = 'CONTRACT_015',
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
  [ContractExceptionCodes.CONTRACT_004]: {
    code_error: ContractExceptionCodes.CONTRACT_004,
    message:
      'There is already a contract with this number for your organization',
  },
  [ContractExceptionCodes.CONTRACT_005]: {
    code_error: ContractExceptionCodes.CONTRACT_005,
    message: 'The volunteer already has a contract for that period',
  },
  [ContractExceptionCodes.CONTRACT_006]: {
    code_error: ContractExceptionCodes.CONTRACT_006,
    message: 'Cannot delete an approved contract',
  },
  [ContractExceptionCodes.CONTRACT_007]: {
    code_error: ContractExceptionCodes.CONTRACT_007,
    message: 'Can only cancel a contract pending to the ADMIN',
  },
  [ContractExceptionCodes.CONTRACT_008]: {
    code_error: ContractExceptionCodes.CONTRACT_008,
    message: 'Legal guardian data is required for under 16 volunteers',
  },
  [ContractExceptionCodes.CONTRACT_009]: {
    code_error: ContractExceptionCodes.CONTRACT_009,
    message: 'FATAL: Error while creating the contract in DB',
  },
  [ContractExceptionCodes.CONTRACT_010]: {
    code_error: ContractExceptionCodes.CONTRACT_010,
    message: '[Create Contract] Invalid input data',
  },
  [ContractExceptionCodes.CONTRACT_011]: {
    code_error: ContractExceptionCodes.CONTRACT_011,
    message: '[Create Contract] Invalid legal guardian data',
  },
  [ContractExceptionCodes.CONTRACT_012]: {
    code_error: ContractExceptionCodes.CONTRACT_012,
    message: '[Create Contract] Invalid personal data',
  },
  [ContractExceptionCodes.CONTRACT_013]: {
    code_error: ContractExceptionCodes.CONTRACT_013,
    message: '[Create Contract] Missing volunteer personal data',
  },
  [ContractExceptionCodes.CONTRACT_014]: {
    code_error: ContractExceptionCodes.CONTRACT_014,
    message:
      'Cannot delete a contract when it has been signed by any of the parties',
  },
  [ContractExceptionCodes.CONTRACT_015]: {
    code_error: ContractExceptionCodes.CONTRACT_015,
    message: 'Error while deleting the contract',
  },
};
