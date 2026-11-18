// Romanian agreement for a number of hours (#712): "1 oră … a fost aprobată", "5 ore … au fost
// aprobate", "20 de ore …" ("de" from 20 on, except when the last two digits are 01-19: "101 ore").
const isOneHour = (hours: number): boolean => Number(hours) === 1;

const hoursOfVolunteering = (hours: number, date: string): string => {
  const value = Number(hours);
  if (isOneHour(value)) return `1 oră de voluntariat din ${date}`;
  const rest = value % 100;
  const withDe =
    Number.isInteger(value) && value >= 20 && (rest === 0 || rest >= 20);
  const shown = String(hours).replace('.', ',');
  return `${shown} ${withDe ? 'de ore' : 'ore'} de voluntariat din ${date}`;
};

const hoursDecided = (hours: number, verb: 'aprobat' | 'respins'): string =>
  isOneHour(hours) ? `a fost ${verb}ă` : `au fost ${verb}e`;

export const NOTIFICATIONS = {
  APPROVE_ACCESS_REQUEST: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `Cererea de înscriere în organizația ${organizationName} a fost aprobată`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Cererea de înscriere în organizația ${organizationName} a fost aprobată`,
      body: '',
    },
  },
  REJECT_ACCESS_REQUEST: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, reason?: string): string =>
        `Cererea de înscriere în organizația ${organizationName} a fost respinsă${
          reason ? `. Motiv: ${reason}` : ''
        }`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Cererea de înscriere în organizația ${organizationName} a fost respinsă`,
      body: (reason?: string): string => (reason ? `Motivul: ${reason}` : ''),
    },
  },
  ARCHIVE_VOLUNTEER: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `${organizationName} a dezactivat contul tău din organizație. Pentru detalii te rugăm să contactezi direct organizația.`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `${organizationName} a dezactivat contul tău din organizație. Pentru detalii te rugăm să contactezi direct organizația.`,
      body: '',
    },
  },
  // #593: to the organization's admins
  VOLUNTEER_LEFT: {
    EMAIL: {
      subject: (volunteerName: string): string =>
        `${volunteerName} a părăsit organizația`,
      body: (volunteerName: string, organizationName: string): string =>
        `${volunteerName} a ieșit din ${organizationName} din aplicația VIC. Profilul rămâne în VIC, la Voluntari inactivi.`,
    },
  },
  NEW_EVENT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `Organizația ${organizationName} a adăugat un eveniment nou`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Organizația ${organizationName} a adăugat un eveniment nou`,
      body: '',
    },
  },
  // #496
  ADDED_TO_EVENT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, eventName: string): string =>
        `Organizația ${organizationName} te-a înscris la evenimentul ${eventName}`,
    },
    EMAIL: {
      subject: (organizationName: string, eventName: string): string =>
        `Organizația ${organizationName} te-a înscris la evenimentul ${eventName}`,
      body: 'Îl găsești în aplicația VIC, la Evenimente.',
    },
  },
  // #501
  REGISTRATION_APPROVED: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, eventName: string): string =>
        `Înscrierea ta la evenimentul ${eventName} (${organizationName}) a fost aprobată`,
    },
    EMAIL: {
      subject: (organizationName: string, eventName: string): string =>
        `Înscrierea ta la evenimentul ${eventName} (${organizationName}) a fost aprobată`,
      body: 'Îl găsești în aplicația VIC, la Evenimente.',
    },
  },
  REGISTRATION_REJECTED: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, eventName: string): string =>
        `Înscrierea ta la evenimentul ${eventName} (${organizationName}) a fost respinsă`,
    },
    EMAIL: {
      subject: (organizationName: string, eventName: string): string =>
        `Înscrierea ta la evenimentul ${eventName} (${organizationName}) a fost respinsă`,
      body: (reason: string): string => `Motiv: ${reason}`,
    },
  },
  APPROVED_HOURS: {
    PUSH: {
      title: 'VIC',
      body: (hours: number, date: string): string =>
        `${hoursOfVolunteering(hours, date)} ${hoursDecided(hours, 'aprobat')}`,
    },
    // #593
    EMAIL: {
      subject: (organizationName: string): string =>
        `Orele tale de voluntariat la ${organizationName} au fost aprobate`,
      body: (hours: number, date: string): string =>
        `${hoursOfVolunteering(hours, date)} ${hoursDecided(hours, 'aprobat')}. ${
          isOneHour(hours) ? 'O găsești' : 'Le găsești'
        } în aplicația VIC.`,
    },
  },
  REJECTED_HOURS: {
    PUSH: {
      title: 'VIC',
      body: (hours: number, date: string): string =>
        `${hoursOfVolunteering(hours, date)} ${hoursDecided(hours, 'respins')}`,
    },
    // #593
    EMAIL: {
      subject: (organizationName: string): string =>
        `Orele tale de voluntariat la ${organizationName} au fost respinse`,
      body: (hours: number, date: string, reason: string): string =>
        `${hoursOfVolunteering(hours, date)} ${hoursDecided(hours, 'respins')}. Motiv: ${reason}`,
    },
  },
  NEW_CONTRACT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `${organizationName} ți-a generat contractul de voluntariat. Intră în aplicație și descarcă documentul.`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `${organizationName} ți-a generat contractul de voluntariat. Intră în aplicație și descarcă documentul.`,
      body: '',
    },
  },
  REJECT_CONTRACT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, reason: string): string =>
        `Contractul tău cu ${organizationName} a fost respins. Motiv: ${reason}`,
    },
    EMAIL: {
      subject: (organizationName: string, reason: string): string =>
        `Contractul tău cu ${organizationName} a fost respins. Motiv: ${reason}`,
      body: '',
    },
  },
  APPROVE_CONTRACT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `Contractul tău cu ${organizationName} a fost aprobat. Descarcă documentul direct din aplicație`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Contractul tău cu ${organizationName} a fost aprobat. Descarcă documentul direct din aplicație`,
      body: '',
    },
  },
  NEW_ANNOUCEMENT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `Ai un mesaj nou de la ${organizationName}`,
    },
  },
};
