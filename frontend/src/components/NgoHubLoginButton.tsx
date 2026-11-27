import React from 'react';
import { useTranslation } from 'react-i18next';
import { ngohubStartUrl } from '../services/auth/auth.api';

// After a VIC logout the next NGO Hub login asks NGO Hub for a fresh login (prompt=login), so on a shared
// computer the next person does not walk into the previous one's NGO Hub session.
const PROMPT_LOGIN_KEY = 'vic_ngohub_prompt_login';

export const markNgoHubPromptLogin = (): void => {
  try {
    localStorage.setItem(PROMPT_LOGIN_KEY, '1');
  } catch {
    // storage off (private mode): NGO Hub keeps its session, nothing else changes
  }
};

const takeNgoHubPromptLogin = (): boolean => {
  try {
    const marked = localStorage.getItem(PROMPT_LOGIN_KEY) === '1';
    localStorage.removeItem(PROMPT_LOGIN_KEY);
    return marked;
  } catch {
    return false;
  }
};

export const isNgoHubEnabled = (): boolean => import.meta.env.VITE_NGOHUB_ENABLED === 'true';

// Leaves VIC for NGO Hub: the API's /start sets the flow cookie and redirects there.
export const startNgoHubLogin = (): void => {
  window.location.assign(ngohubStartUrl(takeNgoHubPromptLogin()));
};

// NGO Hub's mark (the hexagon from NGO Hub's own logo.svg, without the wordmark), inline so VIC does
// not load anything from NGO Hub to draw its login page.
const NgoHubLogo = () => (
  <svg viewBox="0 0 252.1 231.8" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path d="m192.7,10.9l14,2.1,59,104.7-59,104.7-14.9,2.2,60.4-106.9L192.7,10.9Z" fill="#231f20" />
    <polygon
      points="191.7 224.5 132.8 231.8 73.9 224.4 13.6 117.6 72.9 10.9 132.8 0 192.7 10.9 252.1 117.6 191.7 224.5"
      fill="#fed210"
    />
    <polygon
      points="13.6 117.6 73.9 224.4 59 222.3 0 117.6 59 12.9 72.9 10.9 13.6 117.6"
      fill="#231f20"
    />
    <path
      d="m102.6,148h-12.6v-27.1h-21.9v27.1h-12.6v-64.7h12.6v26.4h21.9v-26.4h12.6v64.7Z"
      fill="#231f20"
    />
    <path
      d="m159.8,125.8c0,6.7-2.3,12.2-6.8,16.4-4.5,4.2-10.2,6.3-17,6.3s-12.5-2.1-17-6.3c-4.5-4.2-6.8-9.7-6.8-16.4v-42.5h12.6v42.1c0,3.7,1,6.6,3,8.7,2,2.1,4.7,3.2,8.2,3.2s6.2-1.1,8.2-3.2c2-2.1,3-5,3-8.7v-42.1h12.5v42.5Z"
      fill="#231f20"
    />
    <path
      d="m216.2,129.4c0,5.9-1.8,10.5-5.5,13.7-3.6,3.3-8.4,4.9-14.4,4.9h-27.1v-64.7h26c6.2,0,11.1,1.6,14.7,4.9,3.5,3.3,5.3,7.7,5.3,13.3s-.8,6.1-2.5,8.4c-1.7,2.3-3.5,4-5.5,5,5.9,2.8,8.9,7.6,8.9,14.5Zm-15.7-21.9c1.5-1.4,2.2-3.2,2.2-5.4s-.7-4-2.2-5.4c-1.5-1.4-3.5-2-6.2-2h-12.4v14.9h12.4c2.7,0,4.7-.7,6.2-2Zm.9,27c1.5-1.5,2.2-3.4,2.2-5.7s-.7-4.2-2.2-5.7c-1.5-1.5-3.5-2.2-6.3-2.2h-13.2v15.9h13.2c2.7,0,4.8-.8,6.3-2.3Z"
      fill="#231f20"
    />
  </svg>
);

// "Continue with NGO Hub" for NGO admins (login with NGO Hub, OIDC). Shown only when VITE_NGOHUB_ENABLED.
const NgoHubLoginButton = ({ label, disabled }: { label?: string; disabled?: boolean }) => {
  const { t } = useTranslation('login');
  if (!isNgoHubEnabled()) return null;
  return (
    <button
      type="button"
      className="btn-outline-secondary w-full"
      onClick={startNgoHubLogin}
      disabled={disabled}
    >
      <NgoHubLogo />
      {label ?? t('ngohub')}
    </button>
  );
};

export default NgoHubLoginButton;
