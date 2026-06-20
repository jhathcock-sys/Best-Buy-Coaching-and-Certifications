// @ts-nocheck
// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { Users, Search, AlertTriangle, CheckCircle, Clock, HelpCircle, Sliders } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import PerformanceWizardModal from './PerformanceWizardModal';
import RosterImporterModal from './RosterImporterModal';
import AssociateProfileModal from './AssociateProfileModal';
import { calculateCVI } from '../store/cviHelper';
import RosterAuditor from './RosterAuditor';
import RentsDueAuditor from './RentsDueAuditor';


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



export const getMetricClass = (val, type, dept, emp, deptGoals) => {
    const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || {};
    const target = goals[type] !== undefined ? goals[type] : 0;
    const typeKey = type + 'Type';
    const isHoursType = goals[typeKey] === 'Hours';
    const isDollarsType = goals[typeKey] === 'Dollars';

    if (type === 'memberships') {
      if (isHoursType) {
        // Evaluate memberships by Hours Worked Pace (1 membership per X hours)
        // lower pace (fewer hours per membership) is better!
        const pace = emp.hours / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 3.0 ? 'text-warning' : 'text-danger';
      } else if (isDollarsType) {
        // Evaluate memberships by Dollar Revenue Pace (1 membership per $D revenue)
        // lower pace (fewer dollars per membership) is better!
        const revenue = emp.hours * emp.rph;
        const pace = revenue / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 2000 ? 'text-warning' : 'text-danger';
      }
      return val >= target ? 'text-success' : val >= target - 1 ? 'text-warning' : 'text-danger';
    }

    if (type === 'creditCards') {
      if (isHoursType) {
        // Evaluate credit cards by Hours Worked Pace (1 app per X hours)
        const pace = emp.hours / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 4.0 ? 'text-warning' : 'text-danger';
      } else if (isDollarsType) {
        // Evaluate credit cards by Dollar Revenue Pace (1 app per $D revenue)
        const revenue = emp.hours * emp.rph;
        const pace = revenue / (val || 0.001);
        return pace <= target ? 'text-success' : pace <= target + 3000 ? 'text-warning' : 'text-danger';
      }
      return val >= target ? 'text-success' : val >= target - 1 ? 'text-warning' : 'text-danger';
    }

    if (type === 'warranty') {
      return val >= target ? 'text-success' : val >= target - 3.0 ? 'text-warning' : 'text-danger';
    }
    if (type === 'surveys') {
      return val >= target ? 'text-success' : 'text-danger';
    }
    if (type === 'rph') {
      return val >= target ? 'text-success' : val >= target - 150 ? 'text-warning' : 'text-danger';
    }
    if (type === 'basket') {
      return val >= target ? 'text-success' : val >= target - 30 ? 'text-warning' : 'text-danger';
    }
    if (type === 'm365') {
      return val >= target ? 'text-success' : val >= target - 10 ? 'text-warning' : 'text-danger';
    }
    if (type === 'audio') {
      return val >= target ? 'text-success' : val >= target - 10 ? 'text-warning' : 'text-danger';
    }
    return '';
  };;

export const getPaceText = (val, type, dept, emp, deptGoals) => {
    const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || {};
    const typeKey = type + 'Type';
    const isHoursType = goals[typeKey] === 'Hours';
    const isDollarsType = goals[typeKey] === 'Dollars';

    if (!val || val === 0) return 'No pace';

    if (isHoursType) {
      // 1 app/memb per X hours
      const pace = emp.hours / val;
      return `1 in ${pace.toFixed(1)} hrs`;
    } else if (isDollarsType) {
      // 1 app/memb per $D revenue
      const revenue = emp.hours * emp.rph;
      const pace = revenue / val;
      return `1 in $${Math.round(pace / 100) / 10}k rev`;
    }
    return '';
  };;


