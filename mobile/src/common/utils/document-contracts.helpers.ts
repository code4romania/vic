import { differenceInYears, isAfter, parseISO } from 'date-fns';
import { DocumentContractStatus } from '../enums/document-contract-status.enum';
import { DocumentContract } from '../../services/documents/documents.api';
import {
  ILegalGuardianData,
  IUserPersonalData,
  IUserProfile,
} from '../interfaces/user-profile.interface';

export const isOver16 = (birthday: string | Date) => {
  const birthdayDate = typeof birthday === 'string' ? parseISO(birthday) : birthday;
  const today = new Date();
  const age = differenceInYears(today, birthdayDate);
  return age >= 16;
};

export const isOver16FromCNP = (cnp: string) => {
  if (!cnp) {
    return true;
  }
  // we don't need to perform the calculation before the user has entered all the necessary digits to calculate
  if (cnp.length < 7) {
    return true;
  }

  // CNP example: 2980825... -> 1998-08-25
  //              6000825... -> 2000-08-25

  // if first digit is above 5, then the birth year is 2000+
  const yearPrefix = parseInt(cnp[0], 10) < 5 ? '19' : '20';
  const year = (yearPrefix + cnp.substring(1, 3)).toString();
  const month = cnp.substring(3, 5);
  const day = cnp.substring(5, 7);
  const birthday = new Date(`${year}-${month}-${day}`);

  const age = differenceInYears(new Date(), birthday);
  return age >= 16;
};

export const mapContractToColor = (contract: DocumentContract, t: any) => {
  // rejected contract
  if (
    contract.status === DocumentContractStatus.REJECTED_NGO ||
    contract.status === DocumentContractStatus.REJECTED_VOLUNTEER
  ) {
    return {
      color: 'red-500',
      backgroundColor: 'red-50',
      info: `${t('rejected')}`,
    };
  }
  // expired contract
  if (isAfter(new Date(), new Date(contract.documentEndDate))) {
    return {
      color: 'cool-gray-500',
      backgroundColor: 'cool-gray-50',
      info: `${t('expired')}`,
    };
  }
  // pending
  if (
    contract.status === DocumentContractStatus.PENDING_APPROVAL_NGO ||
    contract.status === DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE ||
    contract.status === DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE
  ) {
    return { color: 'yellow-500', backgroundColor: 'yellow-50', info: '' };
  }
  if (
    isAfter(new Date(), new Date(contract.documentStartDate)) &&
    isAfter(new Date(contract.documentEndDate), new Date())
  ) {
    // active contract
    return {
      color: 'turquoise-500',
      backgroundColor: 'turquoise-50',
      info: `${t('current')}`,
    };
  }

  // default yellow
  return { color: 'yellow-500', backgroundColor: 'yellow-50', info: '' };
};

export const renderContractInfoText = (contract: DocumentContract, t: any) => {
  // rejected contract
  if (
    contract.status === DocumentContractStatus.REJECTED_NGO ||
    contract.status === DocumentContractStatus.REJECTED_VOLUNTEER
  ) {
    return t('contract.rejected');
  }
  // expired contract
  if (isAfter(new Date(), new Date(contract.documentEndDate))) {
    return t('contract.expired');
  }
  // pending volunteer signature
  if (contract.status === DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE) {
    return t('contract.pending_volunteer_signature');
  }
  // pending ngo
  if (
    contract.status === DocumentContractStatus.PENDING_APPROVAL_NGO ||
    contract.status === DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE
  ) {
    return t('contract.pending_ngo_signature');
  }
  // active contract
  if (contract.status === DocumentContractStatus.APPROVED) {
    return t('contract.approved');
  }
};

export const isIdentityDataIncomplete = (userProfile: IUserProfile) => {
  // required fields for all users
  const defaultRequiredFields = [
    'cnp',
    'identityDocumentSeries',
    'identityDocumentNumber',
    'address',
    'identityDocumentIssueDate',
    'identityDocumentExpirationDate',
    'identityDocumentIssuedBy',
  ];

  // required fields for users under 16
  const requiredGuardianFields = [
    'name',
    'identityDocumentSeries',
    'identityDocumentNumber',
    'email',
    'phone',
    'cnp',
    'address',
  ];

  const isUserOver16 = isOver16FromCNP(userProfile ? userProfile?.userPersonalData.cnp : '');

  // check if all required fields are present in userProfile.userPersonalData object
  const isMissingRequiredFields = defaultRequiredFields.some(
    (field) => !userProfile.userPersonalData[field as keyof IUserPersonalData],
  );

  let isMissingGuardianFields = false;

  // check if all required fields for users under 16 are present in userProfile.userPersonalData.legalGuardian object
  if (!isUserOver16) {
    isMissingGuardianFields = requiredGuardianFields.some(
      (field) => !userProfile.userPersonalData.legalGuardian?.[field as keyof ILegalGuardianData],
    );
  }

  return isMissingRequiredFields || isMissingGuardianFields;
};
