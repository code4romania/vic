import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
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

  // #726: the report opens in the viewer; Download there saves it under the name the API gives
  it('opens the report in the viewer and downloads it under the name the API gives', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: t('volunteer:report.view') }));

    const viewer = await screen.findByTestId('pdf-viewer');
    expect(saved).toEqual([]);
    await userEvent.click(
      within(viewer).getByRole('button', {
        name: `${t('documents:viewer.download')} Raport-Elena-Pop.pdf`,
      }),
    );
    expect(saved).toEqual(['Raport-Elena-Pop.pdf']);
  });

  it('shows an error when the report fails', async () => {
    server.use(
      http.get(api('/volunteer/v1/report'), () => new HttpResponse(null, { status: 500 })),
    );
    renderPage(<VolunteerReportButton volunteerId="v1" />);

    await userEvent.click(screen.getByRole('button', { name: t('volunteer:report.view') }));

    await waitFor(() => expect(useErrorToast).toHaveBeenCalledWith(t('volunteer:report.error')));
    expect(saved).toEqual([]);
    expect(screen.queryByTestId('pdf-viewer')).not.toBeInTheDocument();
  });
});
