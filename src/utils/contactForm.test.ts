import { describe, expect, it } from 'vitest';
import {
  MIN_SUBMIT_DELAY_MS,
  validateContactSubmission,
  getContactValidationMessage,
} from './contactForm';

describe('validateContactSubmission', () => {
  const loadedAt = 1_000_000;

  it('rejects submissions that are too fast', () => {
    expect(
      validateContactSubmission({
        formLoadedAt: loadedAt,
        now: loadedAt + MIN_SUBMIT_DELAY_MS - 1,
        gdprConsent: true,
        website: '',
      }),
    ).toBe('too_fast');
  });

  it('requires GDPR consent', () => {
    expect(
      validateContactSubmission({
        formLoadedAt: loadedAt,
        now: loadedAt + MIN_SUBMIT_DELAY_MS,
        gdprConsent: false,
        website: '',
      }),
    ).toBe('gdpr_required');
  });

  it('rejects honeypot submissions', () => {
    expect(
      validateContactSubmission({
        formLoadedAt: loadedAt,
        now: loadedAt + MIN_SUBMIT_DELAY_MS,
        gdprConsent: true,
        website: 'spam-bot',
      }),
    ).toBe('honeypot');
  });

  it('accepts valid submissions', () => {
    expect(
      validateContactSubmission({
        formLoadedAt: loadedAt,
        now: loadedAt + MIN_SUBMIT_DELAY_MS,
        gdprConsent: true,
        website: '',
      }),
    ).toBeNull();
  });
});

describe('getContactValidationMessage', () => {
  it('returns a message for each validation error', () => {
    expect(getContactValidationMessage('too_fast').length).toBeGreaterThan(10);
    expect(getContactValidationMessage('gdpr_required')).toContain('données');
    expect(getContactValidationMessage('honeypot')).toContain('échoué');
  });
});
