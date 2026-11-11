import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';
import RegisterOrganization from './RegisterOrganization';
import { renderPage, t } from '../test/render';
import API from '../services/api';
import { api, businessError, server } from '../test/server';

const f = (key: string) => t(`register_organization:form.${key}.label`);

const fillAll = async () => {
  const type = (label: string, value: string) =>
    userEvent.type(screen.getByLabelText(label), value);
  await type(f('name'), 'Asociatia Test');
  await type(f('taxId'), 'RO18547290');
  await type(f('email'), 'contact@ong.test');
  await type(f('phone'), '+40700000001');
  await type(f('firstName'), 'Tudor');
  await type(f('lastName'), 'Testescu');
  await type(f('adminEmail'), 'tudor@ong.test');
  await type(f('adminPhone'), '+40711000000');
  for (const checkbox of screen.getAllByRole('checkbox')) await userEvent.click(checkbox);
};

const submit = () =>
  userEvent.click(screen.getByRole('button', { name: t('register_organization:submit') }));

describe('RegisterOrganization', () => {
  it('requires the organization and admin fields and the terms', async () => {
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    await submit();
    expect(await screen.findAllByText(t('register_organization:form.required'))).toHaveLength(8);
    expect(screen.getByText(t('register_organization:form.terms.required'))).toBeInTheDocument();
    expect(screen.getAllByText(t('register_organization:form.declaration.required'))).toHaveLength(
      2,
    );
  });

  it('checks the CUI like the backend: RO and spaces are fine, the check digit is not', async () => {
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    await userEvent.type(screen.getByLabelText(f('taxId')), 'RO 185 472 91');
    await submit();
    expect(
      await screen.findByText(t('register_organization:form.tax_id_invalid')),
    ).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText(f('taxId')));
    await userEvent.type(screen.getByLabelText(f('taxId')), 'RO 185 472 90');
    await submit();
    expect(screen.queryByText(t('register_organization:form.tax_id_invalid'))).toBeNull();
  });

  it('asks only the minimum: no description, address, website, logo or statute (#469)', () => {
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    for (const key of ['description', 'address', 'website', 'logo']) {
      expect(screen.queryByLabelText(f(key))).toBeNull();
    }
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it('has no password fields: admins log in with an emailed link (#514)', () => {
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    expect(document.querySelector('input[type="password"]')).toBeNull();
  });

  it('sends the multipart form and shows the masked email', async () => {
    // The FormData as the page hands it to axios (MSW cannot read a jsdom multipart body).
    let form: FormData | undefined;
    const interceptor = API.interceptors.request.use((config) => {
      if (config.url === '/organizations/register') form = config.data as FormData;
      return config;
    });
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    await fillAll();
    await submit();

    expect(
      await screen.findByText(
        t('register_organization:success.title', { organization: 'Asociatia Test' }),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(t('register_organization:success.description', { email: 't•••@ong.test' })),
    ).toBeInTheDocument();
    expect(form?.get('taxId')).toBe('RO18547290');
    // #469: only the minimum
    for (const key of ['address', 'activityArea', 'website', 'description', 'logo', 'statute']) {
      expect(form?.has(key)).toBe(false);
    }
    expect(form?.get('acceptedTerms')).toBe('true');
    // #510: the self-declaration replaces the statute
    expect(form?.get('declaresRegisteredNgo')).toBe('true');
    expect(form?.get('declaresRepresentative')).toBe('true');
    expect(form?.has('password')).toBe(false);
    expect(form?.has('confirmPassword')).toBe(false);
    API.interceptors.request.eject(interceptor);
  });

  it.each([
    ['ORG_004', 409],
  ])('shows the %s message', async (code, status) => {
    server.use(http.post(api('/organizations/register'), () => businessError(status, code)));
    renderPage(<RegisterOrganization />, { auth: { isAuthenticated: false } });
    await fillAll();
    await submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(t(`organization:errors.${code}`));
  });
});
