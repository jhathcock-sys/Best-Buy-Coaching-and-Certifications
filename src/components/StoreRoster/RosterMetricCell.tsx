// @ts-nocheck
import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

// Utility functions for metric calculations
export const getMetricClass = (val, type, dept, emp, deptGoals) => {
  const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || {};
  const target = goals[type] !== undefined ? goals[type] : 0;
  const typeKey = type + 'Type';
  const isHoursType = goals[typeKey] === 'Hours';
  const isDollarsType = goals[typeKey] === 'Dollars';

  if (type === 'memberships') {
    if (isHoursType) {
      const pace = emp.hours / (val || 0.001);
      return pace <= target ? 'text-success' : pace <= target + 3.0 ? 'text-warning' : 'text-danger';
    } else if (isDollarsType) {
      const revenue = emp.hours * emp.rph;
      const pace = revenue / (val || 0.001);
      return pace <= target ? 'text-success' : pace <= target + 2000 ? 'text-warning' : 'text-danger';
    }
    return val >= target ? 'text-success' : val >= target - 1 ? 'text-warning' : 'text-danger';
  }

  if (type === 'creditCards') {
    if (isHoursType) {
      const pace = emp.hours / (val || 0.001);
      return pace <= target ? 'text-success' : pace <= target + 4.0 ? 'text-warning' : 'text-danger';
    } else if (isDollarsType) {
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
};

export const getPaceText = (val, type, dept, emp, deptGoals) => {
  const goals = (deptGoals && (deptGoals[dept] || deptGoals['Front End'])) || {};
  const typeKey = type + 'Type';
  const isHoursType = goals[typeKey] === 'Hours';
  const isDollarsType = goals[typeKey] === 'Dollars';

  if (!val || val === 0) return 'No pace';

  if (isHoursType) {
    const pace = emp.hours / val;
    return `1 in ${pace.toFixed(1)} hrs`;
  } else if (isDollarsType) {
    const revenue = emp.hours * emp.rph;
    const pace = revenue / val;
    return `1 in $${(pace / 1000).toFixed(1)}k rev`;
  }
  return '';
};

export const getEmployeeGap = (emp, deptGoals) => {
  const gaps = [];
  
  if (getMetricClass(emp.memberships, 'memberships', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('Memberships');
  }
  if (getMetricClass(emp.creditCards, 'creditCards', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('Credit Cards');
  }
  if (getMetricClass(emp.warranty, 'warranty', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('GSP Attach');
  }
  if (getMetricClass(emp.surveys, 'surveys', emp.dept, emp, deptGoals) === 'text-danger') {
    gaps.push('5 Star Surveys');
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

export const StatusBadge = ({ gap }) => {
  if (gap === 'None' || !gap || gap.startsWith('None')) {
    return (
      <span className="tag-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
        <CheckCircle size={12} style={{ marginRight: '0.25rem' }} /> Hitting Target
      </span>
    );
  }
  return (
    <span className="tag-pill" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
      <AlertTriangle size={12} style={{ marginRight: '0.25rem' }} /> Gap: {gap}
    </span>
  );
};

export const RosterMetricCell = ({ 
  val, 
  type, 
  dept, 
  emp, 
  displayValue, 
  deptGoals, 
  isDense 
}) => {
  const isDeptMetric = (
    type !== 'basket' && type !== 'm365' && type !== 'audio'
  ) || (
    (type === 'basket' && (dept === 'Computing' || dept === 'Home Theatre')) ||
    (type === 'm365' && dept === 'Computing') ||
    (type === 'audio' && dept === 'Home Theatre')
  );
  
  if (!isDeptMetric) {
    return (
      <td style={{ padding: isDense ? '0.45rem 0.5rem' : '0.85rem 0.75rem', textAlign: 'center', opacity: 0.15 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>—</span>
      </td>
    );
  }
  
  const metricClass = getMetricClass(val, type, dept, emp, deptGoals);
  let pillBg = 'transparent';
  let pillColor = 'var(--text-secondary)';
  let pillBorder = 'transparent';
  let hasPill = false;
  
  if (metricClass === 'text-success') {
    pillBg = 'rgba(16, 185, 129, 0.08)';
    pillColor = 'var(--success)';
    pillBorder = 'rgba(16, 185, 129, 0.2)';
    hasPill = true;
  } else if (metricClass === 'text-warning') {
    pillBg = 'rgba(245, 158, 11, 0.08)';
    pillColor = 'var(--warning)';
    pillBorder = 'rgba(245, 158, 11, 0.2)';
    hasPill = true;
  } else if (metricClass === 'text-danger') {
    pillBg = 'rgba(239, 68, 68, 0.08)';
    pillColor = 'var(--error)';
    pillBorder = 'rgba(239, 68, 68, 0.2)';
    hasPill = true;
  }
  
  const paceText = (type === 'memberships' || type === 'creditCards') ? getPaceText(val, type, dept, emp, deptGoals) : '';
  const showPace = val > 0 && paceText && paceText !== 'No pace';

  return (
    <td style={{ padding: isDense ? '0.45rem 0.5rem' : '0.85rem 0.75rem', textAlign: 'center' }}>
      <div style={{ 
        display: 'inline-flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <span style={{ 
          fontSize: '0.85rem', 
          fontWeight: 700, 
          background: pillBg, 
          border: `1px solid ${pillBorder}`, 
          color: pillColor, 
          padding: hasPill ? '0.25rem 0.65rem' : '0rem', 
          borderRadius: '8px',
          minWidth: hasPill ? '64px' : 'auto',
          textAlign: 'center',
          display: 'inline-block'
        }}>
          {displayValue}
        </span>
        {showPace && (
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontWeight: 500 }}>
            {paceText}
          </span>
        )}
      </div>
    </td>
  );
};
