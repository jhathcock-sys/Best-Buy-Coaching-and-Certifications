import { describe, it, expect } from 'vitest';
import { calculateCVI } from '../cviHelper';

describe('cviHelper - calculateCVI', () => {
  it('returns Neutral when inputs are missing', () => {
    expect(calculateCVI(null, {}, 'Jan 2026')).toBe('0% (Neutral)');
    expect(calculateCVI({}, null, 'Jan 2026')).toBe('0% (Neutral)');
    expect(calculateCVI({}, {}, null)).toBe('0% (Neutral)');
  });

  it('returns Neutral when there is no previous period', () => {
    const employee = { id: 1, memberships: 10 };
    const rosterHistory = {
      'Jan 2026': [{ id: 1, memberships: 10 }]
    };
    expect(calculateCVI(employee, rosterHistory, 'Jan 2026')).toBe('0% (Neutral)');
  });

  it('calculates positive delta correctly (Accelerating)', () => {
    const employee = { 
      id: 1, 
      memberships: 15, // +50% from 10
      creditCards: 20, // +100% from 10
      warranty: 0,
      surveys: 0,
      rph: 0
    };
    const rosterHistory = {
      'Jan 2026': [{ id: 1, memberships: 10, creditCards: 10 }],
      'Feb 2026': [{ id: 1 }] // active period doesn't need to match employee inside rosterHistory, only prevPeriod does
    };
    
    // (50% + 100%) / 2 = 75%
    expect(calculateCVI(employee, rosterHistory, 'Feb 2026')).toBe('+75% (Accelerating)');
  });

  it('calculates negative delta correctly (Needs Review)', () => {
    const employee = { 
      id: 1, 
      memberships: 5, // -50% from 10
      creditCards: 5, // -50% from 10
    };
    const rosterHistory = {
      'Jan 2026': [{ id: 1, memberships: 10, creditCards: 10 }],
      'Feb 2026': [{ id: 1 }]
    };
    
    expect(calculateCVI(employee, rosterHistory, 'Feb 2026')).toBe('-50% (Needs Review)');
  });

  it('handles sorting of date strings correctly', () => {
    const employee = { id: 1, memberships: 15 }; // +50% from Jan
    const rosterHistory = {
      'Feb 2026': [], 
      'Jan 2026': [{ id: 1, memberships: 10 }], // Should be identified as previous to Feb 2026 despite object order
      'Mar 2026': []
    };
    
    expect(calculateCVI(employee, rosterHistory, 'Feb 2026')).toBe('+50% (Accelerating)');
  });

  it('handles denominator of 0 by treating prevVal as 1 for growth calculation', () => {
    const employee = { id: 1, memberships: 5 };
    const rosterHistory = {
      'Jan 2026': [{ id: 1, memberships: 0 }],
      'Feb 2026': []
    };
    
    // (5 - 0) / 1 * 100 = 500%
    expect(calculateCVI(employee, rosterHistory, 'Feb 2026')).toBe('+500% (Accelerating)');
  });
});
