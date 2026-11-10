import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import ContractsTable from './ContractsTable';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';
import API from '../services/api';

vi.mock('../hooks/useToast', () => ({ useErrorToast: vi.fn(), useSuccessToast: vi.fn() }));

const page = (items: unknown[]) => ({
  items,
  meta: {
    itemCount: items.length,
    totalItems: items.length,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  },
});

const contract = (over: Record<string, unknown>) => ({
  id: 'c1',
  contractNumber: '1/2026',
  volunteer: { id: 'v1', name: 'Elena Pop' },
  status: 'SIGNED',
  expiringSoon: false,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T00:00:00.000Z',
  fileName: 'Contract_1.pdf',
  uri: 'https://files/c1.pdf',
  ...over,
});

describe('ContractsTable (#486, #488, #489)', () => {
  it('shows Semnat / În așteptare / Expirat, the period and the "Expiră în curând" tag', async () => {
    server.use(
      http.get(api('/contract'), () =>
        HttpResponse.json(
          page([
            contract({ id: 'a', contractNumber: 'A', expiringSoon: true }),
            contract({ id: 'b', contractNumber: null, status: 'PENDING', endDate: null }),
            contract({ id: 'c', contractNumber: 'C', status: 'EXPIRED' }),
          ]),
        ),
      ),
    );
    renderPage(<ContractsTable query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    expect(await screen.findByText(t('documents:contract.status.SIGNED'))).toBeInTheDocument();
    expect(screen.getByText(t('documents:contract.status.PENDING'))).toBeInTheDocument();
    expect(screen.getByText(t('documents:contract.status.EXPIRED'))).toBeInTheDocument();
    expect(screen.getAllByText(t('documents:contract.expiring_soon'))).toHaveLength(1);
    expect(screen.getByText(/fără dată de final/)).toBeInTheDocument();
    expect(screen.getAllByText('Elena Pop')).toHaveLength(3);
  });

  it('filters by status and searches by volunteer, email or number, through the API', async () => {
    const sent: { status: string | null; search: string | null }[] = [];
    server.use(
      http.get(api('/contract'), ({ request }) => {
        const params = new URL(request.url).searchParams;
        sent.push({ status: params.get('status'), search: params.get('search') });
        return HttpResponse.json(page([]));
      }),
    );
    const setQuery = vi.fn();
    renderPage(
      <ContractsTable
        query={{ limit: 10, page: 1, status: 'EXPIRED' as never, search: 'elena' }}
        setQuery={setQuery}
      />,
    );
    await waitFor(() => expect(sent).toContainEqual({ status: 'EXPIRED', search: 'elena' }));
    expect(await screen.findByText('0 documente găsite')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(t('documents:page.filters.search')));
    await userEvent.type(screen.getByLabelText(t('documents:page.filters.search')), 'R-1');
    await waitFor(() => expect(setQuery).toHaveBeenCalledWith({ search: 'R-1', page: 1 }));
  });

  it('shows the volunteer with initials and email, the document and the Vezi / PDF actions', async () => {
    server.use(
      http.get(api('/contract'), () =>
        HttpResponse.json(page([contract({ volunteerEmail: 'elena@pop.ro' })])),
      ),
    );
    renderPage(<ContractsTable query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    expect(await screen.findByText('elena@pop.ro')).toBeInTheDocument();
    expect(screen.getByText('EP')).toBeInTheDocument();
    expect(screen.getByText('Nr. 1/2026')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('documents:page.view') })).toHaveAttribute(
      'href',
      'https://files/c1.pdf',
    );
    expect(screen.getByRole('button', { name: /PDF Contract_1.pdf/ })).toBeInTheDocument();
  });

  it('on the profile: no volunteer column, no filter, and uploads a signed PDF with its period', async () => {
    // The FormData as the table hands it to axios (MSW cannot read a jsdom multipart body).
    let form: FormData | undefined;
    const interceptor = API.interceptors.request.use((config) => {
      if (config.url === 'contract' && config.method === 'post') form = config.data as FormData;
      return config;
    });
    server.use(
      http.get(api('/contract'), () => HttpResponse.json(page([contract({})]))),
      http.post(api('/contract'), () => HttpResponse.json(contract({}), { status: 201 })),
    );
    renderPage(
      <ContractsTable query={{ limit: 10, page: 1 }} setQuery={vi.fn()} volunteerId="v1" />,
    );
    await screen.findByText(t('documents:contract.status.SIGNED'));
    expect(screen.queryByText('Elena Pop')).not.toBeInTheDocument();
    expect(screen.queryByText(t('documents:contracts.filters.status'))).not.toBeInTheDocument();
    expect(screen.queryByText(t('documents:contracts.actions.download'))).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(t('documents:contracts.actions.upload')));
    const dialog = await screen.findByRole('dialog');
    const file = new File(['%PDF-1.4'], 'semnat.pdf', { type: 'application/pdf' });
    await userEvent.upload(dialog.querySelector('input[type=file]') as HTMLInputElement, file);
    fireEvent.change(
      within(dialog).getByLabelText(t('documents:contract.upload_form.start_date')),
      { target: { value: '01.02.2026' } },
    );
    await userEvent.type(
      within(dialog).getByLabelText(t('documents:contract.upload_form.contract_number')),
      ' 7/2026 ',
    );
    await userEvent.click(within(dialog).getByText(t('documents:contract.upload_form.submit')));

    await waitFor(() => expect(form).toBeDefined());
    expect(form?.get('volunteerId')).toBe('v1');
    expect(form?.get('startDate')).toBe('2026-02-01');
    expect(form?.has('endDate')).toBe(false);
    expect(form?.get('contractNumber')).toBe('7/2026');
    expect((form?.get('contract') as File).name).toBe('semnat.pdf');
    API.interceptors.request.eject(interceptor);
  });

  it('requires the PDF and the start date', async () => {
    server.use(http.get(api('/contract'), () => HttpResponse.json(page([]))));
    renderPage(
      <ContractsTable query={{ limit: 10, page: 1 }} setQuery={vi.fn()} volunteerId="v1" />,
    );
    await userEvent.click(await screen.findByText(t('documents:contracts.actions.upload')));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByText(t('documents:contract.upload_form.submit')));
    expect(
      await within(dialog).findByText(t('documents:contract.upload_form.file_required')),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(t('documents:contract.upload_form.start_required')),
    ).toBeInTheDocument();
  });

  // #490
  it('generates a certificate with the prefilled, editable hours', async () => {
    let sent: Record<string, unknown> | undefined;
    server.use(
      http.get(api('/contract'), () => HttpResponse.json(page([]))),
      http.get(api('/contract/certificate/prefill'), () =>
        HttpResponse.json({
          volunteerId: 'v1',
          volunteerName: 'Elena Pop',
          hours: 42,
          since: '2026-02-01T00:00:00.000Z',
        }),
      ),
      http.post(api('/contract/certificate'), async ({ request }) => {
        sent = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(new Blob(['%PDF-1.4']), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="Adeverinta-Elena-Pop.pdf"',
          },
        });
      }),
    );
    URL.createObjectURL = vi.fn(() => 'blob:x');
    renderPage(
      <ContractsTable query={{ limit: 10, page: 1 }} setQuery={vi.fn()} volunteerId="v1" />,
    );
    await userEvent.click(await screen.findByText(t('documents:contracts.actions.certificate')));
    const dialog = await screen.findByRole('dialog');
    const hours = within(dialog).getByLabelText(t('documents:certificate.form.hours'));
    await waitFor(() => expect(hours).toHaveValue(42));
    expect(within(dialog).getByText(/42 ore aprobate în VIC, din 01.02.2026/)).toBeInTheDocument();
    await userEvent.clear(hours);
    await userEvent.type(hours, '50');
    await userEvent.type(
      within(dialog).getByLabelText(t('documents:certificate.form.purpose')),
      'Dosar de admitere',
    );
    await userEvent.type(
      within(dialog).getByLabelText(t('documents:certificate.form.registration_number')),
      '45/2026',
    );
    await userEvent.click(within(dialog).getByText(t('documents:certificate.form.submit')));

    await waitFor(() => expect(sent).toBeDefined());
    expect(sent).toMatchObject({
      volunteerId: 'v1',
      hours: 50,
      purpose: 'Dosar de admitere',
      registrationNumber: '45/2026',
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('uploads a signed certificate: no end date, and the type is sent', async () => {
    let form: FormData | undefined;
    const interceptor = API.interceptors.request.use((config) => {
      if (config.url === 'contract' && config.method === 'post') form = config.data as FormData;
      return config;
    });
    server.use(
      http.get(api('/contract'), () =>
        HttpResponse.json(page([contract({ type: 'CERTIFICATE', endDate: null })])),
      ),
      http.post(api('/contract'), () => HttpResponse.json(contract({}), { status: 201 })),
    );
    renderPage(
      <ContractsTable query={{ limit: 10, page: 1 }} setQuery={vi.fn()} volunteerId="v1" />,
    );
    expect(await screen.findByText(t('documents:contract.type.CERTIFICATE'))).toBeInTheDocument();
    await userEvent.click(screen.getByText(t('documents:contracts.actions.upload')));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByLabelText(t('documents:contract.type.CERTIFICATE')));
    expect(
      within(dialog).queryByLabelText(t('documents:contract.upload_form.end_date')),
    ).not.toBeInTheDocument();
    await userEvent.upload(
      dialog.querySelector('input[type=file]') as HTMLInputElement,
      new File(['%PDF-1.4'], 'adeverinta.pdf', { type: 'application/pdf' }),
    );
    fireEvent.change(
      within(dialog).getByLabelText(t('documents:contract.upload_form.certificate.start_date')),
      { target: { value: '10.11.2026' } },
    );
    await userEvent.click(within(dialog).getByText(t('documents:contract.upload_form.submit')));
    await waitFor(() => expect(form).toBeDefined());
    expect(form?.get('type')).toBe('CERTIFICATE');
    expect(form?.get('startDate')).toBe('2026-11-10');
    expect(form?.has('endDate')).toBe(false);
    API.interceptors.request.eject(interceptor);
  });
});
