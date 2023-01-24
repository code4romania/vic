import i18n from '../config/i18n';
import { RectangleGroupIcon } from '@heroicons/react/24/outline';
import { IRoute } from '../interfaces/route.interface';

const translations = {
  dashboard: i18n.t('side_menu:options:dashboard'),
};

export const ROUTES: IRoute[] = [
  { id: 0, name: translations.dashboard, href: '', icon: RectangleGroupIcon },
];
