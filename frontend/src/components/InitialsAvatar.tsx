import React from 'react';
import { initialsOf } from './UserMenu';

// A person's initials in a navy circle, for tables and lists without a profile picture.
const InitialsAvatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) => (
  <span
    aria-hidden="true"
    className={`${size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'} shrink-0 rounded-full bg-navy text-yellow font-robotoBold flex items-center justify-center`}
  >
    {initialsOf(name)}
  </span>
);

export default InitialsAvatar;
