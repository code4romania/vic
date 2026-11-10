import React, { ReactNode } from 'react';

export type BadgeTone = 'green' | 'amber' | 'red' | 'gray' | 'navy';

const TONES: Record<BadgeTone, string> = {
  green: 'bg-figure-green text-white',
  amber: 'bg-figure-amber text-white',
  red: 'bg-figure-red text-white',
  gray: 'bg-white text-cool-gray-700 ring-1 ring-inset ring-cool-gray-300',
  navy: 'bg-navy text-white',
};

// A solid status label (Semnat, În așteptare, Expirat...). Strong colors, no pastel.
const StatusBadge = ({ tone, children }: { tone: BadgeTone; children: ReactNode }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-robotoMedium whitespace-nowrap ${TONES[tone]}`}
  >
    {children}
  </span>
);

export default StatusBadge;
