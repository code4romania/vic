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
      body: (organizationName: string): string =>
        `Cererea de înscriere în organizația ${organizationName} a fost respinsă`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Cererea de înscriere în organizația ${organizationName} a fost respinsă`,
      body: '',
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
  APPROVED_HOURS: {
    PUSH: {
      title: 'VIC',
      body: (hours: number, date: string): string =>
        `${hours} ore de voluntariat din ${date} au fost aprobate`,
    },
  },
  REJECTED_HOURS: {
    PUSH: {
      title: 'VIC',
      body: (hours: number, date: string): string =>
        `${hours} ore de voluntariat din ${date} au fost respinse`,
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
        `Contractul tău cu ${organizationName} a fost respins. Descarcă documentul direct din aplicație`,
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
