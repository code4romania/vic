import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import RegisterOrganization from './RegisterOrganization';
import { renderPage, t } from '../test/render';
import API from '../services/api';
import { api, businessError, server } from '../test/server';

// The widget would load Cloudflare's script: hand out a token instead.
vi.mock('../components/Turnstile', () => ({
  default: ({ onToken }: { onToken: (token: string) => void }) => {
    React.useEffect(() => onToken('turnstile-ok'), [onToken]);
    return null;
  },
}));

const f = (key: string) => t(`register_organization:form.${key}.label`);

const fillAll = async () => {
  const type = (label: string, value: string) =>
    userEvent.type(screen.getByLabelText(label), value);
  await type(f('name'), 'Asociatia Test');
  await type(f('taxId'), 'RO123456');
  await type(f('email'), 'contact@ong.test');
  await type(f('phone'), '+40700000001');
  // Free text, no county or city select (R6).
  await type(f('address'), 'Str. Test 1, Cluj');
  await type(f('activityArea'), 'Social');
  await type(f('description'), 'O descriere suficient de lunga pentru voluntari, peste cincizeci.');
  await type(f('firstName'), 'Tudor');
  await type(f('lastName'), 'Testescu');
  await type(f('adminEmail'), 'tudor@ong.test');
  await type(f('adminPhone'), '+40711000000');
  await type(f('password'), 'Secret#123');
  await type(f('confirmPassword'), 'Secret#123');
  await userEvent.click(screen.getByRole('checkbox'));
};

const fileInputs = () => document.querySelectorAll<HTMLInputElement>('input[type="file"]');
const pdf = new File(['%PDF-1.4'], 'statut.pdf', { type: 'application/pdf' });
const submit = () =>
  userEvent.click(screen.getByRole('button', { name: t('register_organization:submit') }));

describe('RegisterOrganization', () => {
  it('requires every field, the statute and the terms', async () => {
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    await submit();
    expect(await screen.findAllByText(t('register_organization:form.required'))).toHaveLength(13);
    expect(screen.getByText(t('register_organization:form.statute.required'))).toBeInTheDocument();
    expect(screen.getByText(t('register_organization:form.terms.required'))).toBeInTheDocument();
  });

  it('refuses a statute that is not a PDF (R32)', async () => {
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    const doc = new File(['hello'], 'statut.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    await userEvent.upload(fileInputs()[1], doc, { applyAccept: false });
    expect(
      await screen.findByText(t('register_organization:form.statute.rejected')),
    ).toBeInTheDocument();
  });

  it('refuses a weak password', async () => {
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    await userEvent.type(screen.getByLabelText(f('password')), 'weak');
    await submit();
    expect(await screen.findByText(t('register_organization:form.password.rule'))).toHaveClass(
      'text-red-500',
    );
  });

  it('sends the multipart form with the Turnstile token and shows the masked email', async () => {
    // The FormData as the page hands it to axios (MSW cannot read a jsdom multipart body).
    let form: FormData | undefined;
    const interceptor = API.interceptors.request.use((config) => {
      if (config.url === '/organizations/register') form = config.data as FormData;
      return config;
    });
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    await fillAll();
    await userEvent.upload(fileInputs()[1], pdf);
    await submit();

    expect(
      await screen.findByText(
        t('register_organization:success.title', { organization: 'Asociatia Test' }),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(t('register_organization:success.description', { email: 't•••@ong.test' })),
    ).toBeInTheDocument();
    expect(form?.get('turnstileToken')).toBe('turnstile-ok');
    // Free text, no county or city select (R6).
    expect(form?.get('address')).toBe('Str. Test 1, Cluj');
    expect(form?.get('acceptedTerms')).toBe('true');
    expect((form?.get('statute') as File).name).toBe('statut.pdf');
    expect(form?.has('confirmPassword')).toBe(false);
    API.interceptors.request.eject(interceptor);
  });

  it.each([
    ['ORG_004', 409],
    ['ORG_006', 400],
  ])('shows the %s message', async (code, status) => {
    server.use(http.post(api('/organizations/register'), () => businessError(status, code)));
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    await fillAll();
    await userEvent.upload(fileInputs()[1], pdf);
    await submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(t(`organization:errors.${code}`));
  });

  it('shows ORG_007 under the statute (R33)', async () => {
    server.use(http.post(api('/organizations/register'), () => businessError(400, 'ORG_007')));
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    await fillAll();
    await userEvent.upload(fileInputs()[1], pdf);
    await submit();
    await waitFor(() =>
      expect(screen.getByText(t('organization:errors.ORG_007'))).toBeInTheDocument(),
    );
  });
});
