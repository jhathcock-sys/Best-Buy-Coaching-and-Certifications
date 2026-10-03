import { describe, it, expect } from 'vitest';
import { calculateCoachingImpact, DailySnapshot } from '../coachingImpact';

describe('calculateCoachingImpact', () => {
  const employeeId = 'emp1';

  it('returns PENDING if coachingDate is invalid', () => {
    const result = calculateCoachingImpact(employeeId, 'invalid-date', []);
    expect(result).toBe('PENDING');
  });

  it('returns PENDING if there are no post snapshots', () => {
    const dailySnapshots: DailySnapshot[] = [
      {
        date: '2023-01-01',
        employees: [{ id: employeeId, name: 'Emp', dept: 'Sales', hours: 4, rph: 100, memberships: 0, creditCards: 0, warranty: 0, surveys: 0, avatar: '' }]
      }
    ];
    // Coaching is on 2023-01-02, no snapshots after
    const result = calculateCoachingImpact(employeeId, '2023-01-02', dailySnapshots);
    expect(result).toBe('PENDING');
  });

  it('calculates HIGH_IMPACT if metrics improve significantly', () => {
    const dailySnapshots: DailySnapshot[] = [
      {
        date: '2023-01-01',
        employees: [{ id: employeeId, name: 'Emp', dept: 'Sales', hours: 8, rph: 100, memberships: 1, creditCards: 0, warranty: 0, revenue: 800, surveys: 0, avatar: '' }]
      },
      {
        date: '2023-01-03', // After coaching on Jan 2
        employees: [{ id: employeeId, name: 'Emp', dept: 'Sales', hours: 8, rph: 200, memberships: 2, creditCards: 0, warranty: 0, revenue: 1600, surveys: 0, avatar: '' }]
      }
    ];
    const result = calculateCoachingImpact(employeeId, '2023-01-02', dailySnapshots);
    expect(result).toBe('HIGH_IMPACT');
  });

  it('calculates NEEDS_FOLLOW_UP if metrics drop', () => {
    const dailySnapshots: DailySnapshot[] = [
      {
        date: '2023-01-01',
        employees: [{ id: employeeId, name: 'Emp', dept: 'Sales', hours: 8, rph: 200, memberships: 2, creditCards: 0, warranty: 0, revenue: 1600, surveys: 0, avatar: '' }]
      },
      {
        date: '2023-01-03',
        employees: [{ id: employeeId, name: 'Emp', dept: 'Sales', hours: 8, rph: 100, memberships: 1, creditCards: 0, warranty: 0, revenue: 800, surveys: 0, avatar: '' }]
      }
    ];
    const result = calculateCoachingImpact(employeeId, '2023-01-02', dailySnapshots);
    expect(result).toBe('NEEDS_FOLLOW_UP');
  });

  it('calculates NEUTRAL if metrics stay mostly the same', () => {
    const dailySnapshots: DailySnapshot[] = [
      {
        date: '2023-01-01',
        employees: [{ id: employeeId, name: 'Emp', dept: 'Sales', hours: 8, rph: 100, memberships: 1, creditCards: 0, warranty: 0, revenue: 800, surveys: 0, avatar: '' }]
      },
      {
        date: '2023-01-03',
        employees: [{ id: employeeId, name: 'Emp', dept: 'Sales', hours: 8, rph: 102, memberships: 1, creditCards: 0, warranty: 0, revenue: 816, surveys: 0, avatar: '' }]
      }
    ];
    const result = calculateCoachingImpact(employeeId, '2023-01-02', dailySnapshots);
    expect(result).toBe('NEUTRAL');
  });
});
