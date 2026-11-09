import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import VolunteerReportButton from './VolunteerReportButton';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';
import { useErrorToast } from '../hooks/useToast';

vi.mock('../hooks/useToast', () => ({ useErrorToast: vi.fn() }));

describe('VolunteerReportButton (#479)', () => {
  let saved: string[] = [];

  beforeEach(() => {
    saved = [];
    URL.createObjectURL = vi.fn(() => 'blob:report');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      saved.push(this.getAttribute('download') as string);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useErrorToast).mockClear();
  });

  it('downloads the PDF under the name the API gives', async () => {
    server.use(
      http.get(
        api('/volunteer/v1/report'),
        () =>
          new HttpResponse('%PDF-1.3', {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="Raport-Elena-Pop.pdf"',
            },
          }),
      ),
    );
    renderPage(<VolunteerReportButton volunteerId="v1" />);

    await userEvent.click(screen.getByRole('button', { name: t('volunteer:report.download') }));

    await waitFor(() => expect(saved).toEqual(['Raport-Elena-Pop.pdf']));
    expect(screen.getByRole('button', { name: t('volunteer:report.download') })).toBeEnabled();
  });

  it('shows an error when the report fails', async () => {
    server.use(
      http.get(api('/volunteer/v1/report'), () => new HttpResponse(null, { status: 500 })),
    );
    renderPage(<VolunteerReportButton volunteerId="v1" />);

    await userEvent.click(screen.getByRole('button', { name: t('volunteer:report.download') }));

    await waitFor(() => expect(useErrorToast).toHaveBeenCalledWith(t('volunteer:report.error')));
    expect(saved).toEqual([]);
  });
});
