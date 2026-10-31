import { describe, expect, it } from 'vitest';
import { defaultSettings } from '@/services/defaults';
import { buildExport, exportFileName } from './exportData';
import { validateChildName, validateEmail, validatePassword } from './validation';

describe('account validation', () => {
  it('checks email, password and child name', () => {
    expect(validateEmail('')).toMatch(/enter your email/);
    expect(validateEmail('nope')).toMatch(/doesn’t look like/);
    expect(validateEmail(' parent@example.com ')).toBeNull();
    expect(validatePassword('short')).toMatch(/8 characters/);
    expect(validatePassword('long enough')).toBeNull();
    expect(validateChildName('  ')).toMatch(/first name/);
    expect(validateChildName('Maya')).toBeNull();
  });
});

describe('data export', () => {
  it('includes settings and story text but not prototype options', () => {
    const now = new Date('2026-10-31T10:00:00Z');
    const data = buildExport({ email: 'p@example.com', settings: defaultSettings(), stories: [], now });
    expect(data.account.email).toBe('p@example.com');
    expect(data.settings).not.toHaveProperty('prototype');
    expect(exportFileName(now)).toBe('little-worlds-export-2026-10-31.json');
  });
});
