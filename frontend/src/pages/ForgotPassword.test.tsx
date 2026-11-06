import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import ForgotPassword from './ForgotPassword';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

describe('ForgotPassword', () => {
  it('always answers "if an account exists"', async () => {
    let body: unknown;
    server.use(
      http.post(api('/auth/web/forgot-password'), async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
    );
    renderPage(<ForgotPassword />, { auth: { isAuthenticated: false } });
    await userEvent.type(screen.getByLabelText(t('forgot_password:email.label')), ' ana@ong.test ');
    await userEvent.click(screen.getByRole('button', { name: t('forgot_password:submit') }));

    expect(await screen.findByText(t('forgot_password:sent'))).toBeInTheDocument();
    expect(body).toEqual({ email: 'ana@ong.test' });
  });

  it('a throttled request (429 without a code) reads as AUTH_010', async () => {
    server.use(
      http.post(api('/auth/web/forgot-password'), () =>
        HttpResponse.json({ statusCode: 429, message: 'ThrottlerException' }, { status: 429 }),
      ),
    );
    renderPage(<ForgotPassword />, { auth: { isAuthenticated: false } });
    await userEvent.type(screen.getByLabelText(t('forgot_password:email.label')), 'ana@ong.test');
    await userEvent.click(screen.getByRole('button', { name: t('forgot_password:submit') }));
    expect(await screen.findByRole('alert')).toHaveTextContent(t('auth:errors.AUTH_010'));
  });
});
