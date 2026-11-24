import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import i18n from './i18n';
import { InternalErrors } from '../errors/internal-errors.class';
import { EVENT_ERRORS } from '../errors/entities/event.errors';
import { AUTH_ERRORS } from '../errors/entities/auth.errors';
import { getSexOptions } from '../constants/sex-options';
import { getReferralOptions } from '../constants/referral-options';
import { activityLogSchema } from '../../components/ActivityLogForm';
import { spokenHours } from '../../components/hours/HoursStepper';
import { getDesignLabels } from '../../design/labels';
import { formatLongDay, formatShortDay, formatTime } from '../utils/event-format';
import { formatLogLongDay } from '../utils/activity-log-format';
import { localeTag } from '../utils/date-locale';
import { useRevalidateOnLanguageChange } from '../../hooks/useRevalidateOnLanguageChange';

// These texts used to be translated once, when the app loaded, and stayed Romanian for good.
// Each is read here in Romanian and again after a change of language, from the very same object.

const switchTo = (language: 'ro' | 'en') =>
  act(async () => {
    await i18n.changeLanguage(language);
  });

const validationErrors = async (value: unknown): Promise<string[]> => {
  try {
    await activityLogSchema.validate(value, { abortEarly: false });
    return [];
  } catch (error: any) {
    return error.errors;
  }
};

beforeEach(() => i18n.changeLanguage('ro'));

describe('texts follow the language without a restart', () => {
  it('the messages of the error classes', async () => {
    expect(InternalErrors.EVENT_ERRORS.getError(EVENT_ERRORS.EVENT_RSVP_007)).toBe(
      'Evenimentul este încheiat',
    );
    expect(InternalErrors.AUTH_ERRORS.getError(AUTH_ERRORS.AUTH_010)).toBe(
      'Prea multe cereri. Încearcă din nou peste un minut.',
    );

    await switchTo('en');

    expect(InternalErrors.EVENT_ERRORS.getError(EVENT_ERRORS.EVENT_RSVP_007)).toBe(
      'The event is closed',
    );
    expect(InternalErrors.AUTH_ERRORS.getError(AUTH_ERRORS.AUTH_010)).toBe(
      'Too many requests. Try again in a minute.',
    );
    // the shared codes and the fallbacks too
    expect(InternalErrors.EVENT_ERRORS.getError('ORG_005' as never)).toBe(
      'The organization is not validated yet or is suspended. Try again later.',
    );
    expect(InternalErrors.EVENT_ERRORS.getError('XYZ_1' as never)).toBe(
      'Data processing error, code: #XYZ_1',
    );
    expect(InternalErrors.EVENT_ERRORS.getError()).toBe('An unknown error has occurred');
  });

  it('the validation messages of a form schema', async () => {
    expect(await validationErrors({ hours: 30, date: new Date(2020, 0, 1) })).toEqual(
      expect.arrayContaining([
        'Alegerea activității este obligatorie',
        'Poți înregistra cel mult 24 de ore pe zi',
      ]),
    );

    await switchTo('en');

    expect(await validationErrors({ hours: 30, date: new Date(2020, 0, 1) })).toEqual(
      expect.arrayContaining([
        'Choosing an activity is required',
        'You can log at most 24 hours a day',
      ]),
    );
  });

  it('the options of the selects', async () => {
    expect(getSexOptions().map((option) => option.label)).toEqual(['Bărbătesc', 'Feminin']);
    expect(getReferralOptions()[0].label).toBe('Rețelele de socializare');

    await switchTo('en');

    expect(getSexOptions().map((option) => option.label)).toEqual(['Male', 'Female']);
    expect(getReferralOptions()[0].label).toBe('Social networks');
  });

  it('the words the design components say on their own', async () => {
    const day = new Date(2026, 10, 13);
    expect(getDesignLabels()).toMatchObject({
      language: 'ro',
      optional: 'opțional',
      close: 'Închide',
      selectPlaceholder: 'Alege',
      datePlaceholder: 'Alege data',
      today: 'Azi',
      yesterday: 'Ieri',
      decrease: 'Scade',
      increase: 'Crește',
    });
    expect(getDesignLabels().formatDate(day)).toBe('Vin, 13 nov 2026');
    expect(getDesignLabels().impactHexagon(42, 5, 1)).toBe(
      '42 de ore aprobate, 5 în așteptare, 1 respinsă',
    );

    await switchTo('en');

    expect(getDesignLabels()).toMatchObject({
      language: 'en',
      optional: 'optional',
      close: 'Close',
      selectPlaceholder: 'Choose',
      datePlaceholder: 'Choose the date',
      today: 'Today',
      yesterday: 'Yesterday',
      decrease: 'Decrease',
      increase: 'Increase',
    });
    expect(getDesignLabels().formatDate(day)).toBe('Fri, 13 Nov 2026');
    expect(getDesignLabels().impactHexagon(42, 5, 1)).toBe(
      '42 approved hours, 5 pending, 1 rejected',
    );
    expect(getDesignLabels().impactHexagon(1, 0, 0)).toBe('1 approved hour');
  });
});

describe('plurals in each language', () => {
  const spoken = (hours: number) => spokenHours(i18n.t.bind(i18n) as any, hours);

  it('Romanian adds „de” from 20 up', () => {
    expect([1, 2, 19, 20, 24, 100, 101].map(spoken)).toEqual([
      'o oră',
      '2 ore',
      '19 ore',
      '20 de ore',
      '24 de ore',
      '100 de ore',
      '101 ore',
    ]);
  });

  it('English has one and many, and no „de”', async () => {
    await switchTo('en');
    expect([1, 2, 19, 20, 24, 100, 101].map(spoken)).toEqual([
      'one hour',
      '2 hours',
      '19 hours',
      '20 hours',
      '24 hours',
      '100 hours',
      '101 hours',
    ]);
  });

  it.each([
    ['ro', 1, '1 voluntar'],
    ['ro', 5, '5 voluntari'],
    ['ro', 120, '120 de voluntari'],
    ['en', 1, '1 volunteer'],
    ['en', 5, '5 volunteers'],
    ['en', 120, '120 volunteers'],
  ])('%s: %s volunteers', async (language, count, expected) => {
    await switchTo(language as 'ro' | 'en');
    expect(i18n.t('organization_profile:volunteers', { count })).toBe(expected);
  });
});

describe('dates in each language', () => {
  const start = new Date(2026, 10, 22, 9, 5);

  it('Romanian', () => {
    expect(formatShortDay(start)).toBe('Dum, 22 nov');
    expect(formatLongDay(start)).toBe('Duminică, 22 noiembrie');
    expect(formatLogLongDay('28/10/2026')).toBe('28 octombrie 2026');
    expect(localeTag()).toBe('ro-RO');
  });

  it('English keeps the day first and the 24-hour clock; only the names change', async () => {
    await switchTo('en');
    expect(formatShortDay(start)).toBe('Sun, 22 Nov');
    expect(formatLongDay(start)).toBe('Sunday, 22 November');
    expect(formatLogLongDay('28/10/2026')).toBe('28 October 2026');
    expect(formatTime(new Date(2026, 10, 22, 21, 5))).toBe('21:05');
    expect(localeTag()).toBe('en-GB');
  });
});

describe('a form with errors on screen', () => {
  const Form = () => {
    const {
      handleSubmit,
      trigger,
      formState: { errors },
    } = useForm<any>({ resolver: yupResolver(activityLogSchema) as any });
    useRevalidateOnLanguageChange(trigger, errors);
    return (
      <>
        <Pressable testID="submit" onPress={handleSubmit(() => undefined)} />
        <Text testID="error">{`${errors.activityTypeId?.message ?? ''}`}</Text>
      </>
    );
  };

  it('shows them in the new language after a switch', async () => {
    await render(<Form />);
    await fireEvent.press(screen.getByTestId('submit'));
    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Alegerea activității este obligatorie',
      ),
    );

    await switchTo('en');

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent('Choosing an activity is required'),
    );
  });

  it('does not validate a form that shows no error', async () => {
    await render(<Form />);

    await switchTo('en');

    expect(screen.getByTestId('error')).toHaveTextContent('');
  });
});
