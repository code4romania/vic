import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import Button from './Button';

// "Pagina 1 din 3" with previous / next, under a list of cards.
const AnnouncementPager = ({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) => (
  <nav className="flex items-center justify-between gap-3 text-sm text-cool-gray-600">
    <span>{i18n.t('announcement:page.pagination', { page, pages })}</span>
    <div className="flex gap-2">
      <Button
        className="btn-outline-secondary"
        label={i18n.t('announcement:page.previous')}
        icon={<ChevronLeftIcon className="w-4 h-4" aria-hidden="true" />}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      />
      <Button
        className="btn-outline-secondary"
        label={i18n.t('announcement:page.next')}
        icon={<ChevronRightIcon className="w-4 h-4" aria-hidden="true" />}
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      />
    </div>
  </nav>
);

export default AnnouncementPager;
