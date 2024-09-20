import { differenceInYears } from 'date-fns';
import { IVolunteer } from '../interfaces/volunteer.interface';

export interface VolunteerDataCheck {
  isIncomplete: boolean;
  missingInfo: string;
}

const fieldTranslations: { [key: string]: string } = {
  guardian: 'Tutore legal',
  cnp: 'CNP',
  identityDocumentSeries: 'Serie buletin',
  identityDocumentNumber: 'Număr buletin',
  address: 'Adresă',
  email: 'Email',
  phone: 'Telefon',
  name: 'Nume',
  identityDocumentIssueDate: 'Data emiterii buletinului',
  identityDocumentExpirationDate: 'Data expirării buletinului',
  identityDocumentIssuedBy: 'Emitentul documentului',
};

export const checkIsVolunteerDataIncomplete = (volunteer: IVolunteer): VolunteerDataCheck => {
  const missingVolunteerFields: string[] = [];
  const missingGuardianFields: string[] = [];

  if (volunteer?.user?.age < 18) {
    if (!volunteer?.user?.userPersonalData?.legalGuardian) {
      missingGuardianFields.push('Necompletat');
    } else {
      const legalGuardian = volunteer.user.userPersonalData.legalGuardian;
      const guardianFields = [
        'cnp',
        'identityDocumentSeries',
        'identityDocumentNumber',
        'address',
        'email',
        'phone',
        'name',
      ];
      guardianFields.forEach((field) => {
        if (!legalGuardian[field as keyof typeof legalGuardian]) {
          missingGuardianFields.push(`${fieldTranslations[field]}`);
        }
      });
    }
  }

  const personalDataFields = [
    'identityDocumentSeries',
    'identityDocumentNumber',
    'identityDocumentIssueDate',
    'identityDocumentExpirationDate',
    'identityDocumentIssuedBy',
    'cnp',
    'address',
  ];

  personalDataFields.forEach((field) => {
    if (
      !volunteer?.user?.userPersonalData?.[field as keyof typeof volunteer.user.userPersonalData]
    ) {
      missingVolunteerFields.push(fieldTranslations[field]);
    }
  });

  const volunteerInfo =
    missingVolunteerFields.length > 0
      ? `Informatii necompletate Voluntar: ${missingVolunteerFields.join(', ')}`
      : '';
  const guardianInfo =
    missingGuardianFields.length > 0
      ? `Informatii necompletate Tutore: ${missingGuardianFields.join(', ')}`
      : '';

  const missingInfo = [volunteerInfo, guardianInfo].filter(Boolean).join('\n\n');

  return {
    isIncomplete: missingVolunteerFields.length > 0 || missingGuardianFields.length > 0,
    missingInfo,
  };
};

export const isOver16FromCNP = (cnp: string) => {
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
