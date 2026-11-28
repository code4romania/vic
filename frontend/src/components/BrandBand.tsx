import React from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/code4ro-commit-global.png';

export const CODE4RO_URL = 'https://code4.ro';

// The band on top of every page, public or not (Maria, 27 Nov 2026): VIC is a Code for Romania /
// Commit Global project. Light gray like the one on Redirecționează; it scrolls away with the page.
// 2.5rem tall: the layouts below it fill `h-below-band` / `min-h-below-band` (tailwind.config).
const BrandBand = () => {
  const { t } = useTranslation('general');
  return (
    <div className="h-10 w-full shrink-0 bg-cool-gray-100 border-b border-cool-gray-200">
      <div className="h-full max-w-[90rem] mx-auto px-4 sm:px-6 xl:px-10 flex items-center">
        <a
          href={CODE4RO_URL}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 inline-flex items-center gap-3 no-underline hover:no-underline text-cool-gray-900 hover:text-cool-gray-900"
        >
          <img
            src={logo}
            alt="Code for Romania · Commit Global"
            className="h-5 sm:h-6 w-auto shrink-0"
          />
          <span className="text-xs sm:text-sm text-cool-gray-900 truncate">{t('brand_band')}</span>
        </a>
      </div>
    </div>
  );
};

export default BrandBand;
