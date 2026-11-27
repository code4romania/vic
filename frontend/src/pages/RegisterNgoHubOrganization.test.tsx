import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import RegisterNgoHubOrganization from './RegisterNgoHubOrganization';
import { renderPage, t } from '../test/render';
import { ADMIN, api, businessError, server } from '../test/server';

const REGISTRATION = {
  ticket: 't'.repeat(43),
  prefill: {
    organization: {
      name: 'Asociatia din NGO Hub',
      taxId: '12345678',
      email: 'contact@ngo.test',
      phone: '+40712345678',
      address: 'Str. Exemplu 1, Cluj-Napoca',
      description: '',
      website: 'https://ngo.test',
      logoUrl: 'https://bucket.test/logo.png',
    },
    admin: { email: 'ana@ngo.test', firstName: 'Ana', lastName: 'Pop' },
  },
};

const render = (state: unknown = REGISTRATION) =>
  renderPage(<RegisterNgoHubOrganization />, {
    route: { pathname: '/register/ngohub', state },
    path: '/register/ngohub',
    auth: { isAuthenticated: false },
  });

const capture = (answer: () => Response) => {
  const forms: FormData[] = [];
  server.use(
    http.post(api('/auth/web/ngohub/register'), async ({ request }) => {
      forms.push(await request.formData());
      return answer();
    }),
  );
  return forms;
};

const fillAndSubmit = async () => {
  await userEvent.type(
    screen.getByLabelText(t('register_organization:form.adminPhone.label')),
    '+40711111112',
  );
  // the label goes on with the terms and privacy links when they are configured
  await userEvent.click(
    screen.getByRole('checkbox', {
      name: new RegExp(`^${t('register_organization:form.terms.label')}`),
    }),
  );
  await userEvent.click(screen.getByRole('button', { name: t('ngohub:register.submit') }));
};

describe('Register an NGO from NGO Hub', () => {
  it('shows the CUI, name and admin email from NGO Hub without letting them change', () => {
    render();
    expect(screen.getByText('Asociatia din NGO Hub')).toBeInTheDocument();
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.getByText('ana@ngo.test')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Asociatia din NGO Hub')).toBeNull();
    expect(screen.getByDisplayValue('contact@ngo.test')).toBeInTheDocument();
  });

  it('links the terms and the privacy policy next to the checkbox, like /register', () => {
    vi.stubEnv('VITE_TERMS_URL', 'https://ngohub.test/terms');
    vi.stubEnv('VITE_PRIVACY_URL', 'https://ngohub.test/privacy');
    render();
    expect(
      screen.getByRole('link', { name: t('register_organization:form.terms.terms') }),
    ).toHaveAttribute('href', 'https://ngohub.test/terms');
    expect(
      screen.getByRole('link', { name: t('register_organization:form.terms.privacy') }),
    ).toHaveAttribute('href', 'https://ngohub.test/privacy');
    vi.unstubAllEnvs();
  });

  it('sends the ticket and the editable fields only, then starts the session', async () => {
    const session = { accessToken: 'access', expiresIn: 900, user: ADMIN };
    const forms = capture(() => HttpResponse.json(session));
    const { auth } = render();

    await fillAndSubmit();

    await waitFor(() => expect(auth.startSession).toHaveBeenCalledWith(session));
    const sent = Object.fromEntries(forms[0].entries());
    expect(sent).toMatchObject({
      ticket: REGISTRATION.ticket,
      email: 'contact@ngo.test',
      adminPhone: '+40711111112',
      firstName: 'Ana',
      useNgoHubLogo: 'true',
      acceptedTerms: 'true',
    });
    expect(sent).not.toHaveProperty('name');
    expect(sent).not.toHaveProperty('taxId');
    expect(sent).not.toHaveProperty('adminEmail');
    expect(sent).not.toHaveProperty('description');
  });

  it('a used or expired ticket asks for a new NGO Hub login', async () => {
    capture(() => businessError(401, 'AUTH_019'));
    render();
    await fillAndSubmit();
    expect(await screen.findByText(t('ngohub:register.expired'))).toBeInTheDocument();
  });

  it('without a ticket (opened directly) asks for a new NGO Hub login', () => {
    render(null);
    expect(screen.getByText(t('ngohub:register.expired'))).toBeInTheDocument();
  });
});
