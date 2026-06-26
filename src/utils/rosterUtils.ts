import { useState, useEffect, useMemo } from 'react';
import { Users, Search, AlertTriangle, CheckCircle, Clock, HelpCircle, Sliders } from 'lucide-react';
import AddEmployeeModal from '../components/AddEmployeeModal';
import PerformanceWizardModal from '../components/PerformanceWizardModal';
import RosterImporterModal from '../components/RosterImporterModal';
import AssociateProfileModal from '../components/AssociateProfileModal';
import { calculateCVI } from '../store/cviHelper';
import RosterAuditor from '../components/RosterAuditor';
import RentsDueAuditor from '../components/RentsDueAuditor';


export const getDeptStyle = (dept) => {
  switch (dept) {
    case 'Computing':
      return { bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.25)' };
    case 'Mobile':
      return { bg: 'rgba(249, 115, 22, 0.12)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.25)' };
    case 'Home Theatre':
      return { bg: 'rgba(139, 92, 246, 0.12)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.25)' };
    case 'Front End':
      return { bg: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee', border: 'rgba(6, 182, 212, 0.25)' };
    case 'Geek Squad':
      return { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.25)' };
    case 'Appliances':
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: 'rgba(16, 185, 129, 0.25)' };
    case 'General Sales':
      return { bg: 'rgba(236, 72, 153, 0.12)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.25)' };
    default:
      return { bg: 'rgba(156, 163, 175, 0.12)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.25)' };
  }
};



import { Employee, DeptGoal } from '../types';

export const getMetricClass = (
  val: number | undefined | null, 
  type: string, 
  dept: string, 
  emp: Employee, 
  deptGoals: Record<string, DeptGoal>
): string => {
  const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || {} as DeptGoal;
  const target = (goals as any)[type] !== undefined ? (goals as any)[type] : 0;
  const typeKey = type + 'Type';
  const isHoursType = (goals as any)[typeKey] === 'Hours';
  const isDollarsType = (goals as any)[typeKey] === 'Dollars';

  const empHours = emp?.hours || 0;
  const empRph = emp?.rph || 0;
  const safeVal = val || 0;

  if (type === 'memberships') {
    if (isHoursType) {
      const pace = empHours / (safeVal || 0.001);
      return pace <= target ? 'text-success' : pace <= target + 3.0 ? 'text-warning' : 'text-danger';
    } else if (isDollarsType) {
      const revenue = empHours * empRph;
      const pace = revenue / (safeVal || 0.001);
      return pace <= target ? 'text-success' : pace <= target + 2000 ? 'text-warning' : 'text-danger';
    }
    return safeVal >= target ? 'text-success' : safeVal >= target - 1 ? 'text-warning' : 'text-danger';
  }

  if (type === 'creditCards') {
    if (isHoursType) {
      const pace = empHours / (safeVal || 0.001);
      return pace <= target ? 'text-success' : pace <= target + 4.0 ? 'text-warning' : 'text-danger';
    } else if (isDollarsType) {
      const revenue = empHours * empRph;
      const pace = revenue / (safeVal || 0.001);
      return pace <= target ? 'text-success' : pace <= target + 3000 ? 'text-warning' : 'text-danger';
    }
    return safeVal >= target ? 'text-success' : safeVal >= target - 1 ? 'text-warning' : 'text-danger';
  }

  if (type === 'warranty') {
    return safeVal >= target ? 'text-success' : safeVal >= target - 3.0 ? 'text-warning' : 'text-danger';
  }
  if (type === 'surveys') {
    return safeVal >= target ? 'text-success' : 'text-danger';
  }
  if (type === 'rph') {
    return safeVal >= target ? 'text-success' : safeVal >= target - 150 ? 'text-warning' : 'text-danger';
  }
  if (type === 'basket') {
    return safeVal >= target ? 'text-success' : safeVal >= target - 30 ? 'text-warning' : 'text-danger';
  }
  if (type === 'm365') {
    return safeVal >= target ? 'text-success' : safeVal >= target - 10 ? 'text-warning' : 'text-danger';
  }
  if (type === 'audio') {
    return safeVal >= target ? 'text-success' : safeVal >= target - 10 ? 'text-warning' : 'text-danger';
  }
  return '';
};

export const getPaceText = (
  val: number | undefined | null, 
  type: string, 
  dept: string, 
  emp: Employee, 
  deptGoals: Record<string, DeptGoal>
): string => {
  const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || {} as DeptGoal;
  const typeKey = type + 'Type';
  const isHoursType = (goals as any)[typeKey] === 'Hours';
  const isDollarsType = (goals as any)[typeKey] === 'Dollars';

  if (!val || val === 0) return 'No pace';

  const empHours = emp?.hours || 0;
  const empRph = emp?.rph || 0;

  if (isHoursType) {
    const pace = empHours / val;
    return `1 in ${pace.toFixed(1)} hrs`;
  } else if (isDollarsType) {
    const revenue = empHours * empRph;
    const pace = revenue / val;
    return `1 in $${(pace / 1000).toFixed(1)}k rev`;
  }
  return '';
};

export const getEmployeeGap = (emp: Employee | undefined | null, deptGoals: Record<string, DeptGoal>): string => {
  if (!emp) return 'None';
  const gaps: string[] = [];
  
  if (getMetricClass(emp.memberships, 'memberships', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('PMs');
  }
  if (getMetricClass(emp.creditCards, 'creditCards', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('Apps');
  }
  if (getMetricClass(emp.warranty, 'warranty', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('GSP');
  }
  if (getMetricClass(emp.surveys, 'surveys', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('5*');
  }
  if (getMetricClass(emp.rph, 'rph', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('RPH');
  }
  if ((emp.dept === 'Computing' || emp.dept === 'Home Theatre') && getMetricClass(emp.basket, 'basket', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('Basket');
  }
  if (emp.dept === 'Computing' && getMetricClass(emp.m365, 'm365', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('M365 Attach');
  }
  if (emp.dept === 'Home Theatre' && getMetricClass(emp.audio, 'audio', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('Audio Attach');
  }
  
  if (gaps.length === 0) return 'None';
  return gaps.join(' & ');
};
