import { describe, it, expect } from 'vitest';
import { toMinutes, toHHMM } from './time.js';

describe('toMinutes', () => {
  it('converts HH:MM strings', () => {
    expect(toMinutes('02:30')).toBe(150);
    expect(toMinutes('1:2')).toBe(62);
    expect(toMinutes(':45')).toBe(45);
  });

  it('handles numbers and numeric strings', () => {
    expect(toMinutes(90)).toBe(90);
    expect(toMinutes('90')).toBe(90);
  });

  it('returns 0 for blank or invalid input', () => {
    expect(toMinutes('')).toBe(0);
    expect(toMinutes(null)).toBe(0);
    expect(toMinutes(undefined)).toBe(0);
    expect(toMinutes('abc')).toBe(0);
  });

  it('strips non-numeric characters', () => {
    expect(toMinutes('1h30m')).toBe(130);
  });
});

describe('toHHMM', () => {
  it('formats minutes to HH:MM', () => {
    expect(toHHMM(0)).toBe('00:00');
    expect(toHHMM(5)).toBe('00:05');
    expect(toHHMM(65)).toBe('01:05');
    expect(toHHMM(150)).toBe('02:30');
  });

  it('rounds and preserves sign', () => {
    expect(toHHMM(90.7)).toBe('01:31');
    expect(toHHMM(-90.4)).toBe('-01:30');
  });

  it('returns 00:00 for invalid numbers', () => {
    expect(toHHMM(Number.NaN)).toBe('00:00');
  });
});
