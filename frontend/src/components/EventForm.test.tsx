import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { QueryClientProvider } from 'react-query';
import EventForm, { EventFormTypes, TargetType } from './EventForm';
import { newQueryClient, t } from '../test/render';

const Form = () => {
  const {
    control,
    formState: { errors },
    watch,
    resetField,
  } = useForm<EventFormTypes>({ defaultValues: { targetType: TargetType.PUBLIC } });
  return <EventForm control={control} errors={errors} watch={watch} resetField={resetField} />;
};

describe('EventForm', () => {
  it('ties every label to its field (accessibility)', () => {
    render(
      <QueryClientProvider client={newQueryClient()}>
        <Form />
      </QueryClientProvider>,
    );
    expect(screen.getByLabelText(`${t('events:form.name.label')}*`)).toHaveAttribute(
      'id',
      'events-form__name',
    );
    expect(screen.getByLabelText(t('events:form.location.label'))).toHaveAttribute(
      'id',
      'events-form__location',
    );
    expect(screen.getByLabelText(t('events:form.capacity.label'))).toHaveAttribute(
      'id',
      'events-form__capacity',
    );
    expect(screen.getByLabelText(`${t('events:form.description.label')}*`).tagName).toBe(
      'TEXTAREA',
    );
    expect(screen.getByLabelText(`${t('events:form.start_date.label')}*`)).toHaveAttribute(
      'id',
      'events-form__start-date',
    );
    expect(screen.getByLabelText(t('events:detail.departments'))).toHaveAttribute(
      'id',
      'events-form__targets',
    );
    expect(
      screen.getByRole('radiogroup', { name: t('events:form.target.label') }),
    ).toBeInTheDocument();
  });
});
