import { NotificationTexts } from './notifications.ro';

// The English texts of the push notifications and of the notification emails, for people who chose English.
const isOneHour = (hours: number): boolean => Number(hours) === 1;

const hoursOfVolunteering = (hours: number, date: string): string =>
  `${hours} ${isOneHour(hours) ? 'hour' : 'hours'} of volunteering on ${date}`;

const hoursDecided = (hours: number, verb: 'approved' | 'rejected'): string =>
  `${isOneHour(hours) ? 'was' : 'were'} ${verb}`;

const uploadedDocument = (
  organizationName: string,
  isCertificate: boolean,
): string =>
  isCertificate
    ? `${organizationName} uploaded a volunteering certificate for you. You can find it in the app, under Documents.`
    : `${organizationName} uploaded your volunteering contract. You can find it in the app, under Documents.`;

export const EN: NotificationTexts = {
  APPROVE_ACCESS_REQUEST: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `Your request to join ${organizationName} was approved`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Your request to join ${organizationName} was approved`,
      body: '',
    },
  },
  REJECT_ACCESS_REQUEST: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, reason?: string): string =>
        `Your request to join ${organizationName} was rejected${
          reason ? `. Reason: ${reason}` : ''
        }`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Your request to join ${organizationName} was rejected`,
      body: (reason?: string): string => (reason ? `Reason: ${reason}` : ''),
    },
  },
  ARCHIVE_VOLUNTEER: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `${organizationName} deactivated your account in the organization. For details, please contact the organization directly.`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `${organizationName} deactivated your account in the organization. For details, please contact the organization directly.`,
      body: '',
    },
  },
  VOLUNTEER_LEFT: {
    EMAIL: {
      subject: (volunteerName: string): string =>
        `${volunteerName} left the organization`,
      body: (volunteerName: string, organizationName: string): string =>
        `${volunteerName} left ${organizationName} from the VIC app. The profile stays in VIC, under Inactive volunteers.`,
    },
  },
  NEW_EVENT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `${organizationName} added a new event`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `${organizationName} added a new event`,
      body: '',
    },
  },
  ADDED_TO_EVENT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, eventName: string): string =>
        `${organizationName} signed you up for the event ${eventName}`,
    },
    EMAIL: {
      subject: (organizationName: string, eventName: string): string =>
        `${organizationName} signed you up for the event ${eventName}`,
      body: 'You can find it in the VIC app, under Events.',
    },
  },
  REGISTRATION_APPROVED: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, eventName: string): string =>
        `Your registration for the event ${eventName} (${organizationName}) was approved`,
    },
    EMAIL: {
      subject: (organizationName: string, eventName: string): string =>
        `Your registration for the event ${eventName} (${organizationName}) was approved`,
      body: 'You can find it in the VIC app, under Events.',
    },
  },
  REGISTRATION_REJECTED: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, eventName: string): string =>
        `Your registration for the event ${eventName} (${organizationName}) was rejected`,
    },
    EMAIL: {
      subject: (organizationName: string, eventName: string): string =>
        `Your registration for the event ${eventName} (${organizationName}) was rejected`,
      body: (reason: string): string => `Reason: ${reason}`,
    },
  },
  APPROVED_HOURS: {
    PUSH: {
      title: 'VIC',
      body: (hours: number, date: string): string =>
        `${hoursOfVolunteering(hours, date)} ${hoursDecided(hours, 'approved')}`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Your volunteering hours at ${organizationName} were approved`,
      body: (hours: number, date: string): string =>
        `${hoursOfVolunteering(hours, date)} ${hoursDecided(hours, 'approved')}. You can find ${
          isOneHour(hours) ? 'it' : 'them'
        } in the VIC app.`,
    },
  },
  REJECTED_HOURS: {
    PUSH: {
      title: 'VIC',
      body: (hours: number, date: string): string =>
        `${hoursOfVolunteering(hours, date)} ${hoursDecided(hours, 'rejected')}`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Your volunteering hours at ${organizationName} were rejected`,
      body: (hours: number, date: string, reason: string): string =>
        `${hoursOfVolunteering(hours, date)} ${hoursDecided(hours, 'rejected')}. Reason: ${reason}`,
    },
  },
  NEW_CONTRACT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, isCertificate = false): string =>
        uploadedDocument(organizationName, isCertificate),
    },
    EMAIL: {
      subject: (organizationName: string, isCertificate = false): string =>
        uploadedDocument(organizationName, isCertificate),
      body: '',
    },
  },
  REJECT_CONTRACT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string, reason: string): string =>
        `Your contract with ${organizationName} was rejected. Reason: ${reason}`,
    },
    EMAIL: {
      subject: (organizationName: string, reason: string): string =>
        `Your contract with ${organizationName} was rejected. Reason: ${reason}`,
      body: '',
    },
  },
  APPROVE_CONTRACT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `Your contract with ${organizationName} was approved. Download the document directly from the app`,
    },
    EMAIL: {
      subject: (organizationName: string): string =>
        `Your contract with ${organizationName} was approved. Download the document directly from the app`,
      body: '',
    },
  },
  NEW_ANNOUCEMENT: {
    PUSH: {
      title: 'VIC',
      body: (organizationName: string): string =>
        `You have a new message from ${organizationName}`,
    },
  },
};
