import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import Organization from './Organization';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

vi.mock('../hooks/useToast', () => ({ useErrorToast: vi.fn(), useSuccessToast: vi.fn() }));

const ORGANIZATION = {
  id: 'org-1',
  name: 'Asociația Test',
  email: 'contact@test.ro',
  phone: '+40700000001',
  taxId: 'RO123456',
  address: 'Str. Exemplu 1',
  website: 'https://test.ro',
  description: 'Ajutăm comunitatea din cartier cu activități pentru copii și vârstnici.',
  logo: null,
  status: 'active',
  validatedAt: '2026-11-01T00:00:00.000Z',
};

const page = (items: unknown[]) => ({
  items,
  meta: {
    itemCount: items.length,
    totalItems: items.length,
    itemsPerPage: 100,
    totalPages: 1,
    currentPage: 1,
  },
});

const division = (id: string, name: string, type: string, numberOfMembers = 0) => ({
  id,
  name,
  type,
  numberOfMembers,
  createdOn: '2026-01-01T00:00:00.000Z',
  createdBy: { id: 'a1', name: 'Ana' },
});

describe('Configurare organizație', () => {
  it('edits the profile in place, with the CUI and its validation, and saves it', async () => {
    let saved: FormData | undefined;
    server.use(
      http.get(api('/organization'), () => HttpResponse.json(ORGANIZATION)),
      http.patch(api('/organization'), async ({ request }) => {
        saved = await request.formData();
        return HttpResponse.json(ORGANIZATION);
      }),
      http.get(api('/organization-structure/:type'), () => HttpResponse.json(page([]))),
      http.get(api('/activity-type'), () => HttpResponse.json([])),
    );
    renderPage(<Organization />, { route: '/organization' });

    expect(await screen.findByDisplayValue('RO123456')).toBeInTheDocument();
    expect(
      screen.getByText(t('organization:setup.info.validated', { date: '01.11.2026' })),
    ).toBeInTheDocument();
    expect(screen.getByText(t('organization:setup.public_banner.title'))).toBeInTheDocument();

    const save = screen.getByRole('button', { name: t('organization:setup.save') });
    expect(save).toBeDisabled();
    const phone = screen.getByDisplayValue('+40700000001');
    await userEvent.clear(phone);
    await userEvent.type(phone, '+40700000009');
    await userEvent.click(save);
    await waitFor(() => expect(saved?.get('phone')).toBe('+40700000009'));
  });

  it('adds, renames and deletes departments as chips, through the existing endpoints', async () => {
    const posted: unknown[] = [];
    const deleted: string[] = [];
    server.use(
      http.get(api('/organization'), () => HttpResponse.json(ORGANIZATION)),
      http.get(api('/organization-structure/:type'), ({ params }) =>
        HttpResponse.json(
          page(params.type === 'department' ? [division('d1', 'Logistică', 'department', 3)] : []),
        ),
      ),
      http.get(api('/activity-type'), () => HttpResponse.json([])),
      http.post(api('/organization-structure'), async ({ request }) => {
        posted.push(await request.json());
        return HttpResponse.json(division('d2', 'Comunicare', 'department'));
      }),
      http.delete(api('/organization-structure/:id'), ({ params }) => {
        deleted.push(params.id as string);
        return HttpResponse.json(params.id);
      }),
    );
    renderPage(<Organization />, { route: '/organization' });

    const departments = await screen.findByRole('list', {
      name: t('organization:setup.chips.department.title'),
    });
    expect(within(departments).getByText('Logistică')).toBeInTheDocument();
    expect(within(departments).getByText('· 3')).toBeInTheDocument();

    const input = screen.getByLabelText(t('organization:setup.chips.department.placeholder'));
    await userEvent.type(input, 'X{Enter}');
    expect(
      await screen.findByText(t('division:form.name.min', { value: '2' })),
    ).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, 'Comunicare{Enter}');
    await waitFor(() => expect(posted).toEqual([{ name: 'Comunicare', type: 'department' }]));

    await userEvent.click(
      screen.getByRole('button', {
        name: t('organization:setup.chips.edit', { name: 'Logistică' }),
      }),
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Logistică')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(
      screen.getByRole('button', {
        name: t('organization:setup.chips.remove', { name: 'Logistică' }),
      }),
    );
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByText(t('general:delete')));
    await waitFor(() => expect(deleted).toEqual(['d1']));
  });
});
