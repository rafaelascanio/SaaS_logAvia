import { describe, it, expect } from 'vitest';
import { toMinutes, toHHMM } from './time.js';

describe('time utilities', () => {
  describe('toMinutes', () => {
    it('converts HH:MM strings to minutes', () => {
      expect(toMinutes('02:30')).toBe(150);
      expect(toMinutes('2:5')).toBe(125);
    });

    it('handles plain minute values and invalid input', () => {
      expect(toMinutes('90')).toBe(90);
      expect(toMinutes(null)).toBe(0);
      expect(toMinutes('abc')).toBe(0);
    });
  });

  describe('toHHMM', () => {
    it('formats minutes into HH:MM', () => {
      expect(toHHMM(0)).toBe('00:00');
      expect(toHHMM(125)).toBe('02:05');
    });
  });
});
