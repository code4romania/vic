import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';
import AuthShell from './AuthShell';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import i18n from '../common/config/i18n';
import { readStoredLanguage } from '../common/config/language';
import { ROUTES } from '../common/constants/routes';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';
import { eventValidationSchema } from '../pages/AddEvent';
import { useRevalidateOnLanguageChange } from '../hooks/useRevalidateOnLanguageChange';
import { renderPage } from '../test/render';
import { api, server } from '../test/server';

const say = (lng: 'ro' | 'en', key: string, options?: Record<string, unknown>): string =>
  i18n.t(key, { ...options, lng }) as string;

const saves = () => {
  const sent: unknown[] = [];
  server.use(
    http.patch(api('/auth/web/language'), async ({ request }) => {
      const body = (await request.json()) as { language: string };
      sent.push(body);
      return HttpResponse.json({ language: body.language });
    }),
  );
  return sent;
};

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ro');
  });

  it('names each language in that language and marks the one on screen', () => {
    renderPage(<LanguageSwitcher />, { auth: { isAuthenticated: false } });

    const group = screen.getByRole('group', { name: say('ro', 'general:language.label') });
    const romanian = within(group).getByRole('button', { name: 'Română' });
    const english = within(group).getByRole('button', { name: 'English' });
    expect(romanian).toHaveAttribute('aria-pressed', 'true');
    expect(romanian).toHaveAttribute('lang', 'ro');
    expect(english).toHaveAttribute('aria-pressed', 'false');
    expect(english).toHaveAttribute('lang', 'en');
  });

  it('before login: switches at once, by keyboard too, and keeps the choice for the account', async () => {
    const sent = saves();
    renderPage(<Landing />, { auth: { isAuthenticated: false } });
    expect(screen.getByRole('heading', { name: say('ro', 'landing:title') })).toBeInTheDocument();

    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'English' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(
      await screen.findByRole('heading', { name: say('en', 'landing:title') }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.lang).toBe('en');
    expect(readStoredLanguage()).toEqual({ language: 'en', pending: true });
    expect(sent).toEqual([]);
  });

  it('is on the public pages that share the auth shell', async () => {
    renderPage(
      <AuthShell title="x">
        <p>form</p>
      </AuthShell>,
      { auth: { isAuthenticated: false } },
    );
    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(await screen.findByText(say('en', 'auth:shell.headline'))).toBeInTheDocument();
  });

  it('in the account menu: saves the choice on the account', async () => {
    const sent = saves();
    renderPage(<UserMenu />);

    await userEvent.click(screen.getByRole('button', { name: /Ana Admin/ }));
    const current = await screen.findByRole('menuitem', { name: 'Română' });
    expect(current).toHaveAttribute('aria-current', 'true');
    await userEvent.click(screen.getByRole('menuitem', { name: 'English' }));

    await waitFor(() => expect(sent).toEqual([{ language: 'en', explicit: true }]));
    expect(i18n.language).toBe('en');
    await waitFor(() => expect(readStoredLanguage()).toEqual({ language: 'en', pending: false }));

    // the menu itself now speaks English
    await userEvent.click(screen.getByRole('button', { name: /Ana Admin/ }));
    expect(
      await screen.findByRole('menuitem', { name: say('en', 'header:menu.options.logout') }),
    ).toBeInTheDocument();
  });
});

describe('texts kept outside components follow the language', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ro');
  });

  it('the side menu entries', async () => {
    expect(ROUTES[0].name).toBe(say('ro', 'side_menu:options.dashboard'));
    const settings = ROUTES.find((route) => route.href === 'settings');
    expect(settings?.name).toBe(say('ro', 'side_menu:options.settings'));
    await i18n.changeLanguage('en');
    expect(settings?.name).toBe(say('en', 'side_menu:options.settings'));
  });

  it('the error messages mapped from the API codes', async () => {
    const message = () => InternalErrors.AUTH_ERRORS.getError(AUTH_ERRORS.AUTH_005);
    expect(message()).toBe(say('ro', 'auth:errors.AUTH_005'));
    await i18n.changeLanguage('en');
    expect(message()).toBe(say('en', 'auth:errors.AUTH_005'));
    expect(InternalErrors.EVENT_ERRORS.getError('ORG_012' as never)).toBe(
      say('en', 'organization:errors.ORG_012'),
    );
    expect(InternalErrors.EVENT_ERRORS.getError('NOPE' as never)).toBe(
      say('en', 'general:error.generic_error', { code: 'NOPE' }),
    );
  });

  it('the validation messages of a schema built once', async () => {
    const nameError = () =>
      eventValidationSchema
        .validateAt('name', { name: '' })
        .then(() => null)
        .catch((error: yup.ValidationError) => error.message);

    expect(await nameError()).toBe(say('ro', 'division:form.name.required'));
    await i18n.changeLanguage('en');
    expect(await nameError()).toBe(say('en', 'division:form.name.required'));
  });

  it('a validator with no message of its own answers in the language on screen', async () => {
    const schema = yup.object({ icon: yup.string().required(), code: yup.string().min(4) });
    const errorOf = (field: string, value: Record<string, unknown>) =>
      schema
        .validateAt(field, value)
        .then(() => null)
        .catch((error: yup.ValidationError) => error.message);

    expect(await errorOf('icon', {})).toBe(say('ro', 'general:required'));
    await i18n.changeLanguage('en');
    expect(await errorOf('icon', {})).toBe(say('en', 'general:required'));
    expect(await errorOf('code', { code: 'ab' })).toBe(
      say('en', 'general:validation.min', { value: 4 }),
    );
  });
});

describe('a form on a public page', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ro');
  });

  it('keeps what was typed and translates the errors already shown (login)', async () => {
    renderPage(<Login />, { auth: { isAuthenticated: false }, route: '/login', path: '/login' });

    const email = screen.getByLabelText(say('ro', 'login:form.email.label'));
    await userEvent.type(email, 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: say('ro', 'login:submit') }));
    expect(await screen.findByText(say('ro', 'login:form.email.invalid'))).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(await screen.findByText(say('en', 'login:form.email.invalid'))).toBeInTheDocument();
    expect(screen.queryByText(say('ro', 'login:form.email.invalid'))).not.toBeInTheDocument();
    expect(screen.getByLabelText(say('en', 'login:form.email.label'))).toHaveValue('not-an-email');
  });

  it('does not check fields nobody touched', async () => {
    const schema = yup.object({ name: yup.string().required() });
    const Form = () => {
      const {
        register,
        trigger,
        formState: { errors },
      } = useForm({ resolver: yupResolver(schema) });
      useRevalidateOnLanguageChange(trigger, errors);
      return (
        <form>
          <input aria-label="name" {...register('name')} />
          <p>{errors.name?.message ?? 'no error'}</p>
        </form>
      );
    };
    renderPage(<Form />, { auth: { isAuthenticated: false } });

    await i18n.changeLanguage('en');
    await waitFor(() => expect(i18n.language).toBe('en'));
    expect(screen.getByText('no error')).toBeInTheDocument();
  });
});
