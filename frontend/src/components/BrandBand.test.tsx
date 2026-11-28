import React from 'react';
import { render, screen } from '@testing-library/react';
import BrandBand, { CODE4RO_URL } from './BrandBand';
import { t } from '../test/render';

// Maria, 27 Nov 2026: on every page, "Un proiect Code for Romania/Commit Global" with the logo
describe('BrandBand', () => {
  it('says whose project VIC is, with the Code for Romania / Commit Global logo', () => {
    render(<BrandBand />);
    expect(screen.getByText(t('general:brand_band'))).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Code for Romania · Commit Global' }),
    ).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', CODE4RO_URL);
    expect(link).toHaveAttribute('target', '_blank');
  });
});
