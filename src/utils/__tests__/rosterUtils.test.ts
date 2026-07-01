import { describe, it, expect } from 'vitest';
import { getMetricClass, getPaceText, getEmployeeGap } from '../rosterUtils';
import { Employee, DeptGoal } from '../../types';

describe('rosterUtils', () => {
  const deptGoals: Record<string, DeptGoal> = {
    'Sales': {
      memberships: 1,
      membershipsType: 'Hours',
      creditCards: 1,
      creditCardsType: 'Hours',
      warranty: 10,
      warrantyType: 'Percentage',
      surveys: 5,
      rph: 500,
      basket: 200,
      m365: 15,
      audio: 15
    } as any
  };

  const emp: Employee = {
    id: '1', name: 'John', dept: 'Sales', hours: 8, rph: 100, avatar: '', surveys: 0
  };

  describe('getMetricClass', () => {
    it('returns text-[var(--success-glow)] when pace is met for hours type', () => {
      // For memberships, target is 1 per hour (Wait, memberships=1? No, 1 in the mock)
      // If empHours=8, val=8 -> pace=1. 1 <= 1 is true.
      expect(getMetricClass(8, 'memberships', 'Sales', emp, deptGoals)).toBe('text-[var(--success-glow)]');
    });

    it('returns text-[var(--bby-yellow)] when slightly off pace', () => {
      // val=4 -> pace=2. 2 <= 1+3.0 (4) -> warning
      expect(getMetricClass(4, 'memberships', 'Sales', emp, deptGoals)).toBe('text-[var(--bby-yellow)]');
    });

    it('returns text-[var(--danger)] when way off pace', () => {
      // val=0 -> pace=Infinity -> danger
      expect(getMetricClass(0, 'memberships', 'Sales', emp, deptGoals)).toBe('text-danger');
    });

    it('handles non-pace metrics correctly (warranty)', () => {
      // target = 10
      expect(getMetricClass(11, 'warranty', 'Sales', emp, deptGoals)).toBe('text-[var(--success-glow)]');
      expect(getMetricClass(8, 'warranty', 'Sales', emp, deptGoals)).toBe('text-[var(--bby-yellow)]');
      expect(getMetricClass(5, 'warranty', 'Sales', emp, deptGoals)).toBe('text-danger');
    });
  });

  describe('getPaceText', () => {
    it('returns No pace if val is 0 or undefined', () => {
      expect(getPaceText(0, 'memberships', 'Sales', emp, deptGoals)).toBe('No pace');
      expect(getPaceText(null, 'memberships', 'Sales', emp, deptGoals)).toBe('No pace');
    });

    it('returns correct pace text for Hours type', () => {
      expect(getPaceText(4, 'memberships', 'Sales', emp, deptGoals)).toBe('1 in 2.0 hrs');
    });

    it('returns correct pace text for Dollars type', () => {
      const dg = { ...deptGoals, Sales: { ...deptGoals.Sales, membershipsType: 'Dollars' } };
      // revenue = 8 * 100 = 800
      expect(getPaceText(2, 'memberships', 'Sales', emp, dg as any)).toBe('1 in $0.4k rev');
    });
  });

  describe('getEmployeeGap', () => {
    it('returns None if employee is null', () => {
      expect(getEmployeeGap(null, deptGoals)).toBe('None');
    });

    it('identifies gaps when metrics are in danger', () => {
      const strugglingEmp = { ...emp, memberships: 1, creditCards: 1, warranty: 5, surveys: 0, rph: 100 };
      const gap = getEmployeeGap(strugglingEmp, deptGoals);
      expect(gap).toContain('PMs');
      expect(gap).toContain('Apps');
      expect(gap).toContain('GSP');
      expect(gap).toContain('RPH');
    });

    it('returns None when no gaps exist', () => {
      const goodEmp = { ...emp, memberships: 8, creditCards: 8, warranty: 15, surveys: 6, rph: 600 };
      expect(getEmployeeGap(goodEmp, deptGoals)).toBe('None');
    });
  });
});
