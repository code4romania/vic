import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum OngHubExceptionCodes {
  ONG_001 = 'ONG_001',
  ONG_002 = 'ONG_002',
  ONG_003 = 'ONG_003',
  ONG_004 = 'ONG_004',
}

type OngHubExceptionCodeType = keyof typeof OngHubExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const OngHubExceptionMessages: Record<
  OngHubExceptionCodes,
  BusinessException<OngHubExceptionCodeType>
> = {
  [OngHubExceptionCodes.ONG_001]: {
    code_error: OngHubExceptionCodes.ONG_001,
    message: 'Could not establish connection with ONG Hub',
  },
  [OngHubExceptionCodes.ONG_002]: {
    message: 'Error while retrieving data from ONG Hub',
    code_error: OngHubExceptionCodes.ONG_002,
  },
  [OngHubExceptionCodes.ONG_003]: {
    message: 'There was unexpected issue while requesting data from ONG Hub',
    code_error: OngHubExceptionCodes.ONG_003,
  },
  [OngHubExceptionCodes.ONG_004]: {
    message: 'Could not update organization with the data from ONG Hub',
    code_error: OngHubExceptionCodes.ONG_004,
  },
};
