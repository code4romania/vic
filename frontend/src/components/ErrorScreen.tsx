import React, { ReactNode } from 'react';
import logo from '../assets/images/app_logo.svg';

interface ErrorScreenProps {
  // A big code above the title (404); an icon otherwise
  code?: string;
  icon?: ReactNode;
  title: string;
  description: string;
  actions: ReactNode;
}

// A whole page outside the app shell (404, maintenance): the logo, then the message centered on the
// gray canvas, in a white card.
const ErrorScreen = ({ code, icon, title, description, actions }: ErrorScreenProps) => (
  <div className="min-h-[100vh] w-full flex flex-col bg-canvas">
    <header className="w-full bg-white border-b border-cool-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center">
        {/* A plain link: the maintenance screen renders outside the router */}
        <a href="/" aria-label="VIC">
          <img src={logo} alt="VIC" className="h-9" />
        </a>
      </div>
    </header>
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-xl border border-cool-gray-200 shadow-card px-6 py-10 sm:px-10 flex flex-col items-center gap-4 text-center">
        {code && (
          <p
            aria-hidden="true"
            className="font-titilliumBold text-[4.5rem] leading-none text-navy tracking-tight"
          >
            {code}
          </p>
        )}
        {icon && (
          <span className="w-14 h-14 rounded-full bg-navy text-yellow flex items-center justify-center">
            {icon}
          </span>
        )}
        <h1 className="text-2xl sm:text-[1.75rem] sm:leading-9">{title}</h1>
        <p className="max-w-sm text-cool-gray-600">{description}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">{actions}</div>
      </div>
    </main>
  </div>
);

export default ErrorScreen;
