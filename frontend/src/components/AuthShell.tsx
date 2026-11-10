import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import logo from '../assets/images/app_logo.svg';
import logoLight from '../assets/images/app_logo_light.svg';
import { classNames } from '../common/utils/utils';

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  // A small icon in a navy circle above the title (envelope, warning...)
  icon?: ReactNode;
  // The registration form is longer: a wider form column
  wide?: boolean;
  children: ReactNode;
}

const POINTS = ['volunteers', 'hours', 'free'] as const;

// The public pages (login, magic link, registration, confirm email): VIC on navy on the left,
// the form on the gray canvas on the right. On phones the navy part shrinks to a top bar.
const AuthShell = ({ title, subtitle, icon, wide, children }: AuthShellProps) => {
  const { t } = useTranslation('auth');

  return (
    <div className="min-h-[100vh] w-full flex flex-col lg:flex-row bg-canvas">
      <aside
        className={classNames(
          wide ? 'lg:w-[34%]' : 'lg:w-[44%]',
          'bg-navy text-white lg:min-h-[100vh] lg:sticky lg:top-0 shrink-0',
        )}
      >
        <div className="h-full flex flex-col gap-10 px-4 py-4 sm:px-8 lg:px-12 lg:py-12">
          <Link to="/" className="self-start" aria-label="VIC">
            <img src={logoLight} alt="VIC" className="h-9 lg:h-12" />
          </Link>
          <div className="hidden lg:flex flex-col gap-6 my-auto">
            <p className="font-titilliumBold text-[2rem] leading-[2.5rem] text-white max-w-md">
              {t('shell.headline')}
            </p>
            <p className="text-navy-100 max-w-md">{t('shell.description')}</p>
            <ul className="flex flex-col gap-4 mt-2">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-white">
                  <CheckCircleIcon className="w-5 h-5 shrink-0 text-yellow" aria-hidden="true" />
                  <span>{t(`shell.points.${point}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="hidden lg:block text-xs text-navy-100">{t('shell.footer')}</p>
        </div>
      </aside>

      <main className="flex-1 flex items-start lg:items-center justify-center px-4 py-8 sm:py-12">
        <div
          className={classNames(
            wide ? 'max-w-2xl' : 'max-w-md',
            'w-full flex flex-col gap-6 bg-white rounded-xl border border-cool-gray-200 shadow-card p-6 sm:p-8',
          )}
        >
          <div className="flex flex-col gap-3">
            {icon && (
              <span className="w-11 h-11 rounded-full bg-navy text-yellow flex items-center justify-center">
                {icon}
              </span>
            )}
            <h1 className="text-2xl sm:text-[1.75rem] sm:leading-9">{title}</h1>
            {subtitle && <p className="text-sm text-cool-gray-600">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export type AuthNoticeTone = 'info' | 'success' | 'warning' | 'error';

const NOTICE_ICONS: Record<AuthNoticeTone, ReactNode> = {
  info: <InformationCircleIcon className="w-5 h-5 shrink-0 text-navy" aria-hidden="true" />,
  success: <CheckCircleIcon className="w-5 h-5 shrink-0 text-figure-green" aria-hidden="true" />,
  warning: (
    <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-figure-amber" aria-hidden="true" />
  ),
  error: <XCircleIcon className="w-5 h-5 shrink-0 text-figure-red" aria-hidden="true" />,
};

// A message inside an auth card: gray block, colored icon and, for errors, a red edge. No pastel.
export const AuthNotice = ({
  tone,
  children,
  role,
}: {
  tone: AuthNoticeTone;
  children: ReactNode;
  role?: 'alert' | 'status';
}) => (
  <div
    role={role ?? (tone === 'error' ? 'alert' : 'status')}
    className={classNames(
      tone === 'error' ? 'border-figure-red' : 'border-cool-gray-200',
      'flex items-start gap-3 rounded-lg border bg-cool-gray-50 p-4 text-sm text-cool-gray-800',
    )}
  >
    {NOTICE_ICONS[tone]}
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

// The dark logo, for public pages on a light background (404, landing header).
export const AuthLogo = ({ className }: { className?: string }) => (
  <img src={logo} alt="VIC" className={className ?? 'h-10'} />
);

export default AuthShell;
