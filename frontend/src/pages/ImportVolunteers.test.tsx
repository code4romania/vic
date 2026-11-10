import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import ImportVolunteers, { IMPORT_TEMPLATE } from './ImportVolunteers';
import { renderPage, t } from '../test/render';
import { api, businessError, server } from '../test/server';
import { useErrorToast } from '../hooks/useToast';
import API from '../services/api';

vi.mock('../hooks/useToast', () => ({ useSuccessToast: vi.fn(), useErrorToast: vi.fn() }));

const f = (key: string, options?: Record<string, unknown>) =>
  t(`volunteers:import.${key}`, options);
const csv = new File(['Prenume,Nume,Email\nMaria,Ionescu,maria@ong.test\n'], 'voluntari.csv', {
  type: 'text/csv',
});
const pickAndImport = async () => {
  await userEvent.upload(document.querySelector<HTMLInputElement>('input[type="file"]')!, csv);
  await userEvent.click(screen.getByRole('button', { name: f('submit') }));
};

describe('ImportVolunteers (#473)', () => {
  it('has a template whose header the backend reads', () => {
    expect(IMPORT_TEMPLATE.split('\r\n')[0]).toBe(
      'Prenume,Nume,Email,Telefon,Localitate,Județ,Departament',
    );
  });

  it('uploads the file and lists what was imported, skipped and refused, by row', async () => {
    // The FormData as the page hands it to axios (MSW cannot read a jsdom multipart body).
    let form: FormData | undefined;
    const interceptor = API.interceptors.request.use((config) => {
      if (config.url === 'volunteer/import') form = config.data as FormData;
      return config;
    });
    server.use(
      http.post(api('/volunteer/import'), () =>
        HttpResponse.json(
          {
            imported: 2,
            skipped: [{ row: 4, email: 'ion@ong.test', reason: 'already_volunteer' }],
            errors: [{ row: 5, reasons: ['email', 'department_not_found'] }],
          },
          { status: 201 },
        ),
      ),
    );
    renderPage(<ImportVolunteers />);
    expect(screen.getByRole('button', { name: f('submit') })).toBeDisabled();
    await pickAndImport();

    expect(await screen.findByRole('status')).toHaveTextContent(f('result.imported', { count: 2 }));
    expect((form?.get('file') as File).name).toBe('voluntari.csv');
    API.interceptors.request.eject(interceptor);
    expect(
      screen.getByText(
        `${f('result.row', { row: 4 })}: ion@ong.test, ${f('skip.already_volunteer')}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `${f('result.row', { row: 5 })}: ${f('reason.email')}; ${f('reason.department_not_found')}`,
      ),
    ).toBeInTheDocument();
  });

  it('shows why an unreadable file is refused (VOLUNTEER_010)', async () => {
    server.use(http.post(api('/volunteer/import'), () => businessError(400, 'VOLUNTEER_010')));
    renderPage(<ImportVolunteers />);
    await pickAndImport();
    await vi.waitFor(() =>
      expect(useErrorToast).toHaveBeenCalledWith(t('volunteers:errors.VOLUNTEER_010')),
    );
  });
});
