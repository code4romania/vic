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
      {label ?? t('ngohub')}
    </button>
  );
};

export default NgoHubLoginButton;
