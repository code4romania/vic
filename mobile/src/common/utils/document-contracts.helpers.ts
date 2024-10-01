import { differenceInYears, isAfter, parseISO } from 'date-fns';
import { DocumentContractStatus } from '../enums/document-contract-status.enum';
import { IDocumentContract, RejectionReason } from '../../services/documents/documents.api';
import {
  ILegalGuardianData,
  IUserPersonalData,
  IUserProfile,
} from '../interfaces/user-profile.interface';
import i18n from '../config/i18n';

export const isOver16 = (birthday: string | Date) => {
  if (!birthday) {
    return true;
  }
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

export const isIdentityDataIncomplete = (userProfile: IUserProfile) => {
  if (!userProfile || !userProfile?.userPersonalData) {
    return true;
  }
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

  const isUserOver16 = isOver16FromCNP(
    userProfile && userProfile?.userPersonalData.cnp ? userProfile?.userPersonalData?.cnp : '',
  );

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

export const mapContractToColor = (contract: IDocumentContract) => {
  switch (contract.status) {
    case DocumentContractStatus.REJECTED_NGO:
    case DocumentContractStatus.REJECTED_VOLUNTEER:
      return {
        color: 'red-500',
        backgroundColor: 'red-50',
        info: `${i18n.t('documents-contract:rejected')}`,
      };
    case DocumentContractStatus.ACTION_EXPIRED:
      return {
        color: 'color-danger-800',
        backgroundColor: 'red-50',
        info: `${i18n.t('documents-contract:action_expired')}`,
      };
    case DocumentContractStatus.EXPIRED:
      return {
        color: 'cool-gray-500',
        backgroundColor: 'cool-gray-50',
        info: `${i18n.t('documents-contract:expired')}`,
      };
    case DocumentContractStatus.PENDING_APPROVAL_NGO:
    case DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE:
    case DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE:
      return { color: 'yellow-500', backgroundColor: 'yellow-50', info: '' };
    case DocumentContractStatus.ACTIVE:
      return {
        color: 'turquoise-500',
        backgroundColor: 'turquoise-50',
        info: `${i18n.t('documents-contract:current')}`,
      };
    case DocumentContractStatus.NOT_STARTED:
      return {
        color: 'green-500',
        backgroundColor: 'green-50',
        info: `${i18n.t('documents-contract:not_started')}`,
      };

    default:
      return { color: 'yellow-500', backgroundColor: 'yellow-50', info: '' };
  }
};

export const mapContractRejectionReasonToText = (rejectionReason: RejectionReason) => {
  switch (rejectionReason) {
    case RejectionReason.INCORRECT_IDENTITY_DATA:
      return i18n.t('documents-contract:reject.reject_reason.incorrect_identity_data');
    case RejectionReason.DONT_AGREE_WITH_CLAUSES:
      return i18n.t('documents-contract:reject.reject_reason.dont_agree_with_clauses');
    case RejectionReason.WRONG_CONTRACT_PERIOD:
      return i18n.t('documents-contract:reject.reject_reason.wrong_contract_period');
    case RejectionReason.OTHER:
      return i18n.t('documents-contract:reject.reject_reason.other');
  }
};

export const renderContractInfoText = (contract: IDocumentContract) => {
  switch (contract.status) {
    case DocumentContractStatus.REJECTED_NGO:
      return i18n.t('documents-contract:contract.rejected.ngo');
    case DocumentContractStatus.REJECTED_VOLUNTEER:
      return i18n.t('documents-contract:contract.rejected.volunteer');
    case DocumentContractStatus.ACTION_EXPIRED:
      return i18n.t('documents-contract:contract.action_expired');
    case DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE:
      return i18n.t('documents-contract:contract.pending_volunteer_signature');
    case DocumentContractStatus.PENDING_APPROVAL_NGO:
    case DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE:
      return i18n.t('documents-contract:contract.pending_ngo_signature');
    case DocumentContractStatus.ACTIVE:
      return i18n.t('documents-contract:contract.active');
    case DocumentContractStatus.EXPIRED:
      return i18n.t('documents-contract:contract.expired');
    case DocumentContractStatus.NOT_STARTED:
      return i18n.t('documents-contract:contract.not_started');
    default:
      if (isAfter(new Date(), new Date(contract.documentEndDate))) {
        return i18n.t('documents-contract:contract.expired');
      }
      return '';
  }
};
