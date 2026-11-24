import React from 'react';
import { Menu } from '@headlessui/react';
import { CheckIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, LANGUAGE_NAMES } from '../common/config/language';
import { useLanguage } from '../hooks/useLanguage';
import { classNames } from '../common/utils/utils';

interface LanguageSwitcherProps {
  // dark: on the navy side of the public pages; light: on white (the landing header)
  tone?: 'dark' | 'light';
  className?: string;
}

// Română | English, for the pages before login. Each name is in its own language, so someone who
// cannot read the current one still finds theirs.
const LanguageSwitcher = ({ tone = 'light', className }: LanguageSwitcherProps) => {
  const { t } = useTranslation('general');
  const { language, setLanguage } = useLanguage();
  const dark = tone === 'dark';

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={classNames(
        dark ? 'border-white/30' : 'border-cool-gray-300',
        'inline-flex shrink-0 rounded-lg border p-0.5 gap-0.5',
        className ?? '',
      )}
    >
      {LANGUAGES.map((option) => {
        const selected = option === language;
        return (
          <button
            key={option}
            id={`language__${option}-btn`}
            type="button"
            lang={option}
            aria-pressed={selected}
            onClick={() => !selected && setLanguage(option)}
            className={classNames(
              selected
                ? dark
                  ? 'bg-white text-navy'
                  : 'bg-navy text-white'
                : dark
                  ? 'text-white hover:bg-white/10'
                  : 'text-cool-gray-700 hover:bg-cool-gray-100',
              dark ? 'focus-visible:ring-yellow' : 'focus-visible:ring-navy',
              'px-2.5 py-1 rounded-md text-sm font-robotoMedium focus:outline-none focus-visible:ring-2',
            )}
          >
            {LANGUAGE_NAMES[option]}
          </button>
        );
      })}
    </div>
  );
};

// The same choice as entries of the account menu (UserMenu), above "Log out".
export const LanguageMenuItems = () => {
  const { t } = useTranslation('general');
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className="pb-1 mb-1 border-b border-cool-gray-200"
    >
      <p
        className="flex items-center gap-3 px-4 pt-2 pb-1 text-xs text-cool-gray-500"
        aria-hidden="true"
      >
        <LanguageIcon className="h-5 w-5" aria-hidden="true" />
        {t('language.label')}
      </p>
      {LANGUAGES.map((option) => {
        const selected = option === language;
        return (
          <Menu.Item key={option}>
            {({ active }) => (
              <button
                id={`language__${option}-menu-item`}
                type="button"
                lang={option}
                aria-current={selected ? 'true' : undefined}
                className={classNames(
                  active ? 'bg-cool-gray-100' : '',
                  selected ? 'font-robotoMedium text-cool-gray-900' : 'text-cool-gray-700',
                  'w-full flex items-center gap-3 pl-12 pr-4 py-2 text-sm',
                )}
                onClick={() => !selected && setLanguage(option)}
              >
                <span className="flex-1 text-left">{LANGUAGE_NAMES[option]}</span>
                {selected && <CheckIcon className="h-4 w-4 text-navy" aria-hidden="true" />}
              </button>
            )}
          </Menu.Item>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
