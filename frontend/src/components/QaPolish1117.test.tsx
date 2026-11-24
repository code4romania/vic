import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import ContractsTable, { fileTypeLabel } from './ContractsTable';
import DivisionChips from './DivisionChips';
import Volunteers from '../pages/Volunteers';
import { renderPage } from '../test/render';
import { api, server } from '../test/server';
import { DivisionType } from '../common/enums/division-type.enum';
import i18n from '../common/config/i18n';

vi.mock('../hooks/useToast', () => ({ useErrorToast: vi.fn(), useSuccessToast: vi.fn() }));

// Small fixes from the staging QA on 17 Nov 2026 (#679, #680, #682, #688, #689).

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

// The wording checks below are about one language's grammar, so each names its language instead of
// following the one the suite runs in.
const say = (lng: 'ro' | 'en', key: string, options?: Record<string, unknown>): string =>
  i18n.t(key, { ...options, lng }) as string;

describe('event capacity counts (#679)', () => {
  it.each([
    ['ro', 1, '1 înscris, fără limită'],
    ['ro', 2, '2 înscriși, fără limită'],
    ['ro', 20, '20 de înscriși, fără limită'],
    ['en', 1, '1 registered, no limit'],
    ['en', 20, '20 registered, no limit'],
  ] as const)('%s: %i → %s', (lng, going, text) => {
    expect(say(lng, 'events:detail.capacity_unlimited', { going, count: going })).toBe(text);
  });
});

describe('event form copy (#680)', () => {
  it.each([
    ['ro', 'evenimentul'],
    ['en', 'the event'],
  ] as const)(
    '%s: says "%s", and explains why a published event keeps its audience',
    (lng, word) => {
      expect(say(lng, 'events:form.target.disclaimer')).toContain(word);
      expect(say(lng, 'events:form.target.locked')).not.toContain('events:');
    },
  );
});

describe('old volunteer status in the action archive (#682)', () => {
  it.each([
    ['ro', 'arhivat'],
    ['en', 'archived'],
  ] as const)('%s: translates "archived"', (lng, text) => {
    expect(say(lng, 'volunteer:status.archived')).toBe(text);
  });
});

describe('contract download button names the file type (#688)', () => {
  it.each([
    ['Contract_1.pdf', 'PDF'],
    ['Contract_1.docx', 'DOCX'],
    ['fara-extensie', 'PDF'],
    [undefined, 'PDF'],
  ])('%p → %p', (fileName, label) => {
    expect(fileTypeLabel(fileName, 'PDF')).toBe(label);
  });

  it('shows DOCX for a Word contract', async () => {
    server.use(
      http.get(api('/contract'), () =>
        HttpResponse.json(
          page([
            {
              id: 'c1',
              contractNumber: '1',
              volunteer: { id: 'v1', name: 'Elena Pop' },
              status: 'SIGNED',
              expiringSoon: false,
              startDate: '2026-01-01T00:00:00.000Z',
              endDate: null,
              fileName: 'Contract_1.docx',
              uri: 'https://files/c1.docx',
            },
          ]),
        ),
      ),
    );
    renderPage(<ContractsTable query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    expect(await screen.findByRole('button', { name: /DOCX Contract_1.docx/ })).toBeInTheDocument();
  });
});

describe('small UI fixes (#689)', () => {
  it.each([
    ['ro', DivisionType.BRANCH, 'Cluj', 'Șterge filiala', 'această filială'],
    ['ro', DivisionType.DEPARTMENT, 'Logistică', 'Șterge departamentul', 'acest departament'],
    ['en', DivisionType.BRANCH, 'Cluj', 'Delete branch', 'this branch'],
    ['en', DivisionType.DEPARTMENT, 'Logistică', 'Delete department', 'this department'],
  ] as const)(
    '%s: asks to delete a %s with the right grammar',
    async (lng, type, name, title, phrase) => {
      await i18n.changeLanguage(lng);
      server.use(
        http.get(api(`/organization-structure/${type}`), () =>
          HttpResponse.json(page([{ id: 'd1', name, numberOfMembers: 0 }])),
        ),
      );
      renderPage(<DivisionChips type={type} />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: say(lng, 'organization:setup.chips.remove', { name }),
        }),
      );

      expect(await screen.findByText(title)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(phrase))).toBeInTheDocument();
    },
  );

  it('the volunteer name opens the profile', async () => {
    server.use(
      http.get(api('/volunteer'), () =>
        HttpResponse.json(
          page([
            {
              id: 'vol-1',
              status: 'active',
              createdOn: '2026-01-01T00:00:00.000Z',
              user: { id: 'u1', name: 'Ana Activ' },
              profile: null,
              approvedHours: 0,
            },
          ]),
        ),
      ),
      http.get(api('/listing/*'), () => HttpResponse.json([])),
    );
    renderPage(<Volunteers query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    expect((await screen.findByText('Ana Activ')).closest('a')).toHaveAttribute('href', '/vol-1');
  });
});
