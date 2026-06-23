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

export const RosterMetricCell = React.memo(({ 
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
      <td className={`roster-td ${isDense ? 'roster-td-dense' : 'roster-td-standard'} metric-empty-cell`}>
        <span className="metric-empty">—</span>
      </td>
    );
  }
  
  const metricClass = getMetricClass(val, type, dept, emp, deptGoals);
  let pillClass = 'metric-pill';
  if (metricClass === 'text-success') {
    pillClass += ' metric-pill-styled metric-pill-success';
  } else if (metricClass === 'text-warning') {
    pillClass += ' metric-pill-styled metric-pill-warning';
  } else if (metricClass === 'text-danger') {
    pillClass += ' metric-pill-styled metric-pill-danger';
  }
  
  const paceText = (type === 'memberships' || type === 'creditCards') ? getPaceText(val, type, dept, emp, deptGoals) : '';
  const showPace = val > 0 && paceText && paceText !== 'No pace';

  return (
    <td className={`roster-td ${isDense ? 'roster-td-dense' : 'roster-td-standard'} roster-td-center`}>
      <div className="metric-cell-container">
        <span className={pillClass}>
          {displayValue}
        </span>
        {showPace && (
          <span className="metric-pace">
            {paceText}
          </span>
        )}
      </div>
    </td>
  );
});
