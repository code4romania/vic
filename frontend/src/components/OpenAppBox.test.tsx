import React from 'react';
import { render, screen } from '@testing-library/react';

// Staging had only the Play URL set and the App Store button was missing: both show without env.
describe('OpenAppBox store links', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('shows the App Store and Google Play links without the env values', async () => {
    vi.stubEnv('VITE_APP_STORE_URL', '');
    vi.stubEnv('VITE_PLAY_STORE_URL', '');
    vi.resetModules();
    const { default: OpenAppBox } = await import('./OpenAppBox');
    render(<OpenAppBox title="Cont de voluntar" />);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('https://apps.apple.com/ro/app/vic/id6474194051');
    expect(hrefs).toContain('https://play.google.com/store/apps/details?id=org.commitglobal.vic');
  });

  it('uses the env values when they are set', async () => {
    vi.stubEnv('VITE_APP_STORE_URL', 'https://apps.apple.test/vic');
    vi.resetModules();
    const { default: OpenAppBox } = await import('./OpenAppBox');
    render(<OpenAppBox title="Cont de voluntar" />);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('https://apps.apple.test/vic');
  });
});
