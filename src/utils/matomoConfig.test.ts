import { describe, expect, it } from 'vitest';
import { getMatomoConfig } from './matomoConfig';

describe('getMatomoConfig', () => {
  it('returns null when env vars are missing', () => {
    expect(getMatomoConfig()).toBeNull();
  });
});
