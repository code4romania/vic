export const NOTIFICATIONS = {
  APPROVE_ACCESS_REQUEST: {
    PUSH: {
      title: 'TEO',
      body: (organizationName: string): string =>
        `Cerearea de inscriere in organizatia ${organizationName} a fost aprobata`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Cerearea de inscriere in organizatia ${organizationName} a fost aprobata`,
      body: '',
    },
  },
  REJECT_ACCESS_REQUEST: {
    PUSH: {
      title: 'TEO',
      body: (organizationName: string): string =>
        `Cerearea de inscriere in organizatia ${organizationName} a fost respinsa`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Cerearea de inscriere in organizatia ${organizationName} a fost respinsa`,
      body: '',
    },
  },
  ARCHIVE_VOLUNTEER: {
    PUSH: {
      title: 'TEO',
      body: (organizationName: string): string =>
        `${organizationName} a dezactivat contul tau din organizatie. Pentru detalii te rugăm să contactezi direct organizația. `,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `${organizationName} a dezactivat contul tau din organizatie. Pentru detalii te rugăm să contactezi direct organizația. `,
      body: '',
    },
  },
  NEW_EVENT: {
    PUSH: {
      title: 'TEO',
      body: (organizationName: string): string =>
        `Organizatia ${organizationName} a adaugat un eveniment nou`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Organizatia ${organizationName} a adaugat un eveniment nou`,
      body: '',
    },
  },
  APPROVED_HOURS: {
    PUSH: {
      title: 'TEO',
      body: (hours: number, date: string): string =>
        `${hours} din ${date} au fost aprobate`,
    },
  },
  REJECTED_HOURS: {
    PUSH: {
      title: 'TEO',
      body: (hours: number, date: string): string =>
        `${hours} din ${date} au fost respinse`,
    },
  },
  NEW_CONTRACT: {
    PUSH: {
      title: 'TEO',
      body: (organizationName: string): string =>
        `${organizationName} ți-a generat contractul de voluntariat. Intră în app și descarcă documentul.`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `${organizationName} ți-a generat contractul de voluntariat. Intră în app și descarcă documentul.`,
      body: '',
    },
  },
  REJECT_CONTRACT: {
    PUSH: {
      title: 'TEO',
      body: (organizationName: string, reason: string): string =>
        `Contractul tau cu ${organizationName} a fost respins. Motiv: ${reason}`,
    },
    EMAIL: {
      subject: (organizationName: string, reason: string): string =>
        `Contractul tau cu ${organizationName} a fost respins. Motiv: ${reason}`,
      body: '',
    },
  },
  APPROVE_CONTRACT: {
    PUSH: {
      title: 'TEO',
      body: (organizationName: string): string =>
        `Contractul tau cu ${organizationName} a fost aprobat. Descarca documentul direct din aplicatie`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Contractul tau cu ${organizationName} a fost respins. Descarca documentul direct din aplicatie`,
      body: '',
    },
  },
  NEW_ANNOUCEMENT: {
    PUSH: {
      title: 'TEO',
      body: (organizationName: string): string =>
        `Ai un mesaj nou de la ${organizationName}`,
    },
  },
};
