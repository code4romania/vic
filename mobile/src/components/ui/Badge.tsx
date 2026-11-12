import React from 'react';
import { StatusTone } from '../../common/theme/tokens';
import { StatusChip, StatusKind } from '../../design/components/Chip';

export interface BadgeProps {
  label: string;
  tone?: StatusTone;
}

// legacy tones → „Îndrăzneț” status pills (each with a color plus an icon or texture)
const KIND: Record<StatusTone, StatusKind> = {
  ok: 'ok',
  wait: 'wait',
  no: 'no',
  neutral: 'exp',
  accent: 'act',
};

/** Status badge: ok (green ✓), wait (striped), no (red ✕), neutral (slate), accent (navy/yellow). */
export const Badge = ({ label, tone = 'neutral' }: BadgeProps) => (
  <StatusChip label={label} kind={KIND[tone]} />
);

export default Badge;
