import { describe, it, expect } from 'vitest';
import { normalizeZone, fuzzyMatchName, parseShiftHours, generateBreaks, WEEKDAY_KEYS } from '../scheduleParserUtils';
import { Employee } from '../../types';

describe('scheduleParserUtils', () => {
  describe('normalizeZone', () => {
    it('normalizes zones correctly', () => {
      expect(normalizeZone('laptop')).toBe('Computing');
      expect(normalizeZone('phone')).toBe('Mobile');
      expect(normalizeZone('tv')).toBe('Home Theatre');
      expect(normalizeZone('checkout')).toBe('Front End');
      expect(normalizeZone('geek squad')).toBe('Geek Squad');
      expect(normalizeZone('fridge')).toBe('Appliances');
      expect(normalizeZone('unknown')).toBe('Computing'); // Default
    });
  });

  describe('fuzzyMatchName', () => {
    const roster: Employee[] = [
      { id: '1', name: 'John Doe', dept: 'Sales', hours: 0, rph: 0, surveys: 0, avatar: '' },
      { id: '2', name: 'Jane Smith', dept: 'Sales', hours: 0, rph: 0, surveys: 0, avatar: '' }
    ];

    it('matches exact names', () => {
      expect(fuzzyMatchName('John Doe', roster)?.id).toBe('1');
    });

    it('matches partial names', () => {
      expect(fuzzyMatchName('Jane', roster)?.id).toBe('2');
    });

    it('matches with tokens', () => {
      expect(fuzzyMatchName('J Smith', roster)?.id).toBe('2');
    });

    it('returns null if no match', () => {
      expect(fuzzyMatchName('Nobody', roster)).toBeNull();
    });
  });

  describe('parseShiftHours', () => {
    it('parses standard shift formats', () => {
      const { duration, startTimeStr } = parseShiftHours('9:00 AM - 5:00 PM');
      expect(duration).toBe(8);
      expect(startTimeStr).toBe('9:00 AM');
    });

    it('handles implicit PMs for typical retail hours', () => {
      const { duration, startTimeStr } = parseShiftHours('2:00 - 7:00');
      // 2:00 PM to 7:00 PM
      expect(duration).toBe(5);
      expect(startTimeStr).toBe('2:00 PM');
    });

    it('returns defaults for invalid shifts', () => {
      const { duration, startTimeStr } = parseShiftHours('OFF');
      expect(duration).toBe(0);
      expect(startTimeStr).toBe('9:00 AM');
    });
  });

  describe('generateBreaks', () => {
    it('generates 3 breaks for >= 7.5 hours', () => {
      const breaks = generateBreaks('emp1', 'John', '9:00 AM', 8);
      expect(breaks.length).toBe(3);
      expect(breaks[0].type).toBe('15 min Break');
      expect(breaks[1].type).toBe('30 min Lunch');
      expect(breaks[2].type).toBe('15 min Break');
    });

    it('generates 1 lunch for >= 5.5 hours', () => {
      const breaks = generateBreaks('emp1', 'John', '9:00 AM', 6);
      expect(breaks.length).toBe(1);
      expect(breaks[0].type).toBe('30 min Lunch');
    });

    it('generates 1 break for >= 4.0 hours', () => {
      const breaks = generateBreaks('emp1', 'John', '9:00 AM', 4);
      expect(breaks.length).toBe(1);
      expect(breaks[0].type).toBe('15 min Break');
    });

    it('generates no breaks for short shifts', () => {
      const breaks = generateBreaks('emp1', 'John', '9:00 AM', 3);
      expect(breaks.length).toBe(0);
    });
  });

  describe('WEEKDAY_KEYS', () => {
    it('exports weekday keys', () => {
      expect(WEEKDAY_KEYS.length).toBeGreaterThan(0);
    });
  });
});
