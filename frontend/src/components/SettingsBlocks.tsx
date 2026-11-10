import React, { ComponentType, ReactNode, SVGProps } from 'react';
import Card from '../layouts/CardLayout';
import { classNames } from '../common/utils/utils';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

interface SettingsCardProps {
  icon: Icon;
  title: string;
  subtitle?: string;
  children: ReactNode;
  // the danger zone: red title and border
  danger?: boolean;
}

// A settings card: icon, title and subtitle on top, the content under them (prototype "Setări").
export const SettingsCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  danger,
}: SettingsCardProps) => (
  <Card className={danger ? 'border-figure-red' : ''}>
    <section className="flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <Icon
          className={classNames(
            danger ? 'text-figure-red' : 'text-navy',
            'mt-0.5 w-5 h-5 shrink-0',
          )}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2 className={danger ? 'text-figure-red' : ''}>{title}</h2>
          {subtitle && <p className="text-sm text-cool-gray-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  </Card>
);

// A subsection title inside a settings card (e.g. "Securitate cont").
export const SettingsSubtitle = ({ icon: Icon, children }: { icon?: Icon; children: string }) => (
  <h3 className="flex items-center gap-2 pt-5 border-t border-cool-gray-200">
    {Icon && <Icon className="w-5 h-5 text-navy" aria-hidden="true" />}
    {children}
  </h3>
);

interface SettingsRowProps {
  title: string;
  description?: ReactNode;
  note?: ReactNode;
  action?: ReactNode;
  // gray block (data rows) or a plain row with a divider (security rows)
  boxed?: boolean;
  danger?: boolean;
}

// One setting: title and description on the left, its button or badge on the right.
export const SettingsRow = ({
  title,
  description,
  note,
  action,
  boxed = true,
  danger,
}: SettingsRowProps) => (
  <div
    className={classNames(
      boxed ? 'rounded-lg bg-cool-gray-50 border border-cool-gray-100 p-4' : 'py-4',
      'flex flex-col sm:flex-row sm:items-center justify-between gap-3',
    )}
  >
    <div className="flex flex-col gap-1 min-w-0">
      <p
        className={classNames(
          danger ? 'text-figure-red' : 'text-cool-gray-900',
          'font-robotoMedium',
        )}
      >
        {title}
      </p>
      {description && <div className="text-sm text-cool-gray-600 break-words">{description}</div>}
      {note && <div className="text-xs text-cool-gray-500">{note}</div>}
    </div>
    {action && <div className="shrink-0 self-start sm:self-center">{action}</div>}
  </div>
);

// A read-only value in a gray field, as the prototype's account form shows it.
export const SettingsField = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <span className="text-sm font-robotoMedium text-cool-gray-700">{label}</span>
    <p className="rounded-lg bg-cool-gray-50 border border-cool-gray-200 px-3 py-2.5 text-cool-gray-900 break-words">
      {value || '-'}
    </p>
  </div>
);
