import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getMetricClass, getPaceText } from '../../utils/rosterUtils';
import { Employee } from '../../types';

export interface StatusBadgeProps {
  gap: string;
}

export const StatusBadge = ({ gap }: StatusBadgeProps) => {
  if (!gap || gap === 'None' || gap.startsWith('None')) {
    return (
      <span className="tag-pill tag-pill-success" data-testid="status-badge-success">
        <CheckCircle size={12} className="roster-icon-inline" /> Hitting Target
      </span>
    );
  }
  return (
    <span className="tag-pill tag-pill-error" data-testid="status-badge-error">
      <AlertTriangle size={12} className="roster-icon-inline" /> Gap: {gap}
    </span>
  );
};

export interface RosterMetricCellProps {
  val: number | undefined | null;
  type: string;
  dept: string;
  emp: Employee;
  displayValue: string | number;
  isDense: boolean;
}

export const RosterMetricCell = React.memo(({ 
  val, 
  type, 
  dept, 
  emp, 
  displayValue, 
  isDense 
}: RosterMetricCellProps) => {
  const deptGoals = useStore((state) => state.deptGoals);

  const isDeptMetric = (
    type !== 'basket' && type !== 'm365' && type !== 'audio'
  ) || (
    (type === 'basket' && (dept === 'Computing' || dept === 'Home Theatre')) ||
    (type === 'm365' && dept === 'Computing') ||
    (type === 'audio' && dept === 'Home Theatre')
  );
  
  if (!isDeptMetric) {
    return (
      <td className={`roster-td ${isDense ? 'roster-td-dense' : 'roster-td-standard'} metric-empty-cell`} data-testid={`metric-cell-${type}-empty`}>
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
  const showPace = (val || 0) > 0 && paceText && paceText !== 'No pace';

  return (
    <td className={`roster-td ${isDense ? 'roster-td-dense' : 'roster-td-standard'} roster-td-center`} data-testid={`metric-cell-${type}`}>
      <div className="metric-cell-container">
        <span className={pillClass} data-testid={`metric-pill-${type}`}>
          {displayValue}
        </span>
        {showPace && (
          <span className="metric-pace" data-testid={`metric-pace-${type}`}>
            {paceText}
          </span>
        )}
      </div>
    </td>
  );
});

