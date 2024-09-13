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
