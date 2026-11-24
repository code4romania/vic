import { http, HttpResponse } from 'msw';
import { waitFor } from '@testing-library/react';
import i18n from '../../common/config/i18n';
import { readStoredLanguage, storeLanguage } from '../../common/config/language';
import { api, businessError, server } from '../../test/server';
import { chooseLanguage, syncAccountLanguage } from './language.service';

// Every PATCH /auth/web/language the app sends, in order.
const watchSaves = (answer?: (body: { language: string; explicit: boolean }) => Response) => {
  const saves: { language: string; explicit: boolean }[] = [];
  server.use(
    http.patch(api('/auth/web/language'), async ({ request }) => {
      const body = (await request.json()) as { language: string; explicit: boolean };
      saves.push(body);
      return answer ? answer(body) : HttpResponse.json({ language: body.language });
    }),
  );
  return saves;
};

describe('the account language and this browser', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ro');
  });

  describe('syncAccountLanguage (every profile the API returns)', () => {
    it('takes the account language and keeps it for the pages before login', async () => {
      const saves = watchSaves();
      await syncAccountLanguage('en');

      expect(i18n.language).toBe('en');
      expect(readStoredLanguage()).toEqual({ language: 'en', pending: false });
      expect(saves).toEqual([]);
    });

    it('an admin from before VIC was bilingual stays in Romanian on an English browser', async () => {
      await i18n.changeLanguage('en'); // what the login page detected
      const saves = watchSaves();
      await syncAccountLanguage('ro');

      expect(i18n.language).toBe('ro');
      expect(saves).toEqual([]);
    });

    it('a change made on another browser arrives here', async () => {
      storeLanguage('ro', false);
      await syncAccountLanguage('en');
      expect(i18n.language).toBe('en');
    });

    it('a choice made on this browser before login wins and is saved on the account', async () => {
      await i18n.changeLanguage('en');
      storeLanguage('en', true);
      const saves = watchSaves();
      await syncAccountLanguage('ro');

      expect(i18n.language).toBe('en');
      await waitFor(() => expect(saves).toEqual([{ language: 'en', explicit: true }]));
      await waitFor(() => expect(readStoredLanguage()).toEqual({ language: 'en', pending: false }));
    });

    it('keeps the choice pending when saving fails, and tries again at the next profile', async () => {
      await i18n.changeLanguage('en');
      storeLanguage('en', true);
      let fail = true;
      const saves = watchSaves((body) =>
        fail
          ? businessError(500, 'INTERNAL_ERROR')
          : HttpResponse.json({ language: body.language }),
      );

      await syncAccountLanguage('ro');
      await waitFor(() => expect(saves).toHaveLength(1));
      expect(readStoredLanguage()).toEqual({ language: 'en', pending: true });
      expect(i18n.language).toBe('en');

      fail = false;
      await syncAccountLanguage('ro');
      await waitFor(() => expect(readStoredLanguage()).toEqual({ language: 'en', pending: false }));
    });

    it('an account with no language yet gets the one on screen, without overwriting', async () => {
      await i18n.changeLanguage('en');
      const saves = watchSaves();
      await syncAccountLanguage(null);

      await waitFor(() => expect(saves).toEqual([{ language: 'en', explicit: false }]));
      await waitFor(() => expect(readStoredLanguage()).toEqual({ language: 'en', pending: false }));
      expect(i18n.language).toBe('en');
    });

    it('takes what the API kept when another browser filled the account first', async () => {
      await i18n.changeLanguage('en');
      watchSaves(() => HttpResponse.json({ language: 'ro' }));
      await syncAccountLanguage(undefined);

      await waitFor(() => expect(i18n.language).toBe('ro'));
      expect(readStoredLanguage()).toEqual({ language: 'ro', pending: false });
    });

    it('a failed request leaves the language on screen alone', async () => {
      await i18n.changeLanguage('en');
      const saves = watchSaves(() => businessError(500, 'INTERNAL_ERROR'));
      await syncAccountLanguage(null);

      await waitFor(() => expect(saves).toHaveLength(1));
      expect(i18n.language).toBe('en');
    });
  });

  describe('chooseLanguage (the switcher)', () => {
    it('logged out: changes the screen and waits for the login to reach the account', async () => {
      const saves = watchSaves();
      await chooseLanguage('en', false);

      expect(i18n.language).toBe('en');
      expect(document.documentElement.lang).toBe('en');
      expect(readStoredLanguage()).toEqual({ language: 'en', pending: true });
      expect(saves).toEqual([]);
    });

    it('logged in: saves the choice on the account as explicit', async () => {
      const saves = watchSaves();
      await chooseLanguage('en', true);

      expect(i18n.language).toBe('en');
      expect(saves).toEqual([{ language: 'en', explicit: true }]);
      expect(readStoredLanguage()).toEqual({ language: 'en', pending: false });
    });

    it('logged in and offline: the screen still changes and the choice stays pending', async () => {
      watchSaves(() => HttpResponse.error());
      await chooseLanguage('en', true);

      expect(i18n.language).toBe('en');
      expect(readStoredLanguage()).toEqual({ language: 'en', pending: true });
    });
  });
});
