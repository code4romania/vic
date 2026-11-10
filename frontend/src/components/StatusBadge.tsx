import React, { ReactNode } from 'react';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';

export type BadgeTone = 'green' | 'amber' | 'red' | 'gray' | 'navy';

const TONES: Record<BadgeTone, string> = {
  green: 'bg-figure-green text-white',
  amber: 'bg-figure-amber text-white',
  red: 'bg-figure-red text-white',
  gray: 'bg-white text-cool-gray-700 ring-1 ring-inset ring-cool-gray-300',
  navy: 'bg-navy text-white',
};

// The same status has the same color on every page
export const ACTIVITY_LOG_STATUS_TONE: Record<ActivityLogStatus, BadgeTone> = {
  [ActivityLogStatus.APPROVED]: 'green',
  [ActivityLogStatus.REJECTED]: 'red',
  [ActivityLogStatus.PENDING]: 'amber',
};

// The one status label of the app (Semnat, În așteptare, Expirat...). Strong colors, no pastel;
// the outlined gray tone is only for neutral states (Inactiv, Finalizat).
const StatusBadge = ({ tone, children }: { tone: BadgeTone; children: ReactNode }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-robotoMedium whitespace-nowrap ${TONES[tone]}`}
  >
    {children}
  </span>
);

export default StatusBadge;
