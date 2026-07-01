import { describe, it, expect } from 'vitest';
import { parseRentsDueCSVLocal, mapParsedRentsToRoster } from '../rentsDueUtils';
import { Employee } from '../../types';

describe('rentsDueUtils', () => {
  describe('parseRentsDueCSVLocal', () => {
    it('returns null for empty string', async () => {
      const result = await parseRentsDueCSVLocal('');
      expect(result).toBeNull();
    });

    it('returns null for non-csv string', async () => {
      const result = await parseRentsDueCSVLocal('no commas or tabs here');
      expect(result).toBeNull();
    });

    it('parses valid CSV data with heuristics', async () => {
      const csvData = `Name,RPH,Revenue,Apps,Memberships
John Doe,100,500,1,2
Jane Doe,200,1000,3,4`;
      const result = await parseRentsDueCSVLocal(csvData);
      expect(result?.parsedData).toBeDefined();
      expect(result?.parsedData?.length).toBe(2);
      expect(result?.parsedData?.[0].name).toBe('John Doe');
      expect(result?.parsedData?.[0].rph).toBe(100);
      expect(result?.parsedData?.[1].name).toBe('Jane Doe');
    });

    it('identifies when mapping is required', async () => {
      const csvData = `Col1,Col2
John Doe,100`;
      const result = await parseRentsDueCSVLocal(csvData);
      expect(result?.requiresMapping).toBe(true);
    });
  });

  describe('mapParsedRentsToRoster', () => {
    it('maps parsed rents to existing roster', () => {
      const parsedData = [
        { name: 'John Doe', rph: 150, revenue: 1500, apps: 2, memberships: 3 }
      ];
      const roster: Employee[] = [
        { id: '1', name: 'John Doe', dept: 'Sales', hours: 10, rph: 100, surveys: 0, avatar: '' }
      ];

      const result = mapParsedRentsToRoster(parsedData, roster);
      expect(result.updatedCount).toBe(1);
      expect(result.addedCount).toBe(0);
      expect(result.importList[0].rph).toBe(150);
      expect(result.importList[0].id).toBe('1');
    });

    it('adds new employees if not found in roster', () => {
      const parsedData = [
        { name: 'Jane Doe', rph: 150, revenue: 1500, apps: 2, memberships: 3 }
      ];
      const roster: Employee[] = [];

      const result = mapParsedRentsToRoster(parsedData, roster);
      expect(result.updatedCount).toBe(0);
      expect(result.addedCount).toBe(1);
      expect(result.importList[0].name).toBe('Jane Doe');
      expect(result.importList[0].id).toMatch(/^emp-/);
    });
  });
});
