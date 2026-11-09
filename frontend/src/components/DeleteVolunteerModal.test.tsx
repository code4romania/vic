import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import DeleteVolunteerModal from './DeleteVolunteerModal';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const page = (items: unknown[]) => ({
  items,
  meta: {
    itemCount: items.length,
    totalItems: items.length,
    itemsPerPage: 20,
    totalPages: 1,
    currentPage: 1,
  },
});

describe('DeleteVolunteerModal (#484)', () => {
  let saved: string[] = [];
  let types: (string | null)[] = [];

  beforeEach(() => {
    saved = [];
    types = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      saved.push(this.getAttribute('download') as string);
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('offers the contract for download before the final delete', async () => {
    server.use(
      http.get(api('/contract'), ({ request }) => {
        types.push(new URL(request.url).searchParams.get('type'));
        return HttpResponse.json(
          page([
            {
              id: 'c1',
              contractNumber: '7/2026',
              fileName: 'Contract_7.pdf',
              uri: 'https://f/c1.pdf',
              startDate: '2026-01-01',
            },
          ]),
        );
      }),
    );
    const onConfirm = vi.fn();
    renderPage(
      <DeleteVolunteerModal
        volunteerId="v1"
        volunteerName="Elena Pop"
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    expect(
      screen.getByText(t('volunteer:delete.title', { name: 'Elena Pop' })),
    ).toBeInTheDocument();
    expect(await screen.findByText(t('volunteer:delete.download_hint'))).toBeInTheDocument();
    expect(types).toContain('CONTRACT');

    await userEvent.click(screen.getByRole('button', { name: t('volunteer:delete.download') }));
    expect(saved).toEqual(['Contract_7.pdf']);
    expect(onConfirm).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: t('volunteer:delete.confirm') }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('without contracts there is nothing to download', async () => {
    server.use(http.get(api('/contract'), () => HttpResponse.json(page([]))));
    renderPage(
      <DeleteVolunteerModal
        volunteerId="v1"
        volunteerName="Elena Pop"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText(t('volunteer:delete.description'))).toBeInTheDocument(),
    );
    expect(screen.queryByText(t('volunteer:delete.download_hint'))).not.toBeInTheDocument();
  });
});
