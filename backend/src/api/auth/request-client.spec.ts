import { Request } from 'express';
import { requestLanguage } from './request-client';

const request = (acceptLanguage?: string): Request =>
  ({
    headers: acceptLanguage ? { 'accept-language': acceptLanguage } : {},
  }) as unknown as Request;

describe('requestLanguage', () => {
  it('reads the exact language the apps send', () => {
    expect(requestLanguage(request('ro'))).toBe('ro');
    expect(requestLanguage(request('en'))).toBe('en');
    expect(requestLanguage(request(' EN '))).toBe('en');
  });

  // An app version from before the languages sends nothing, or the phone's or browser's own list.
  it("ignores a browser's or a phone's own header, and other languages", () => {
    expect(requestLanguage(request())).toBeNull();
    expect(requestLanguage(request('en-US,en;q=0.9,ro;q=0.8'))).toBeNull();
    expect(requestLanguage(request('en-GB'))).toBeNull();
    expect(requestLanguage(request('hu'))).toBeNull();
    expect(requestLanguage(request('*'))).toBeNull();
  });
});
