import { useState, useEffect } from 'react';
import { AlertCircle, Check, Play, ClipboardList } from 'lucide-react';

import { Employee } from '../../types';
import { useCalculatedMetrics } from '../../hooks/useCalculatedMetrics';

interface DashboardAlertsProps {
  onCompleteFollowUpTask: (taskId: string) => void;
  onCoachEmployee: (employee: Employee) => void;
  onShadowEmployee: (employee: Employee) => void;
}

export default function DashboardAlerts({ 
  onCompleteFollowUpTask, 
  onCoachEmployee, 
  onShadowEmployee 
}: DashboardAlertsProps) {
  const [mounted, setMounted] = useState(false);
  const { activeFocus5Alerts, pendingTasks } = useCalculatedMetrics();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (!activeFocus5Alerts?.length && !pendingTasks?.length)) return null;

  return (
    <div data-testid="dashboard-alerts" className="flex-column gap-md animate-fade-in">
      {activeFocus5Alerts?.map((alert, idx) => (
        <div 
          key={`alert-${idx}`} 
          data-testid={`focus5-alert-card-${idx}`}
          className="glass-card glow-pulse alert-card-danger flex-between flex-wrap gap-md p-md" 
        >
          <div className="flex-center gap-md">
            <div className="flex-center p-sm bg-error-alpha rounded-full">
              <AlertCircle size={24} color="var(--error)" />
            </div>
            <div>
              <h3 className="m-0 mb-xs font-bold text-white text-lg">
                Missed Focus 5 Contact
              </h3>
              <p className="m-0 text-secondary text-sm">
                <strong className="text-error">{alert?.employee?.name || 'Unknown Employee'}</strong> is in {alert?.zone || 'Unknown Zone'} but hasn't received a Focus 5 check-in today.
              </p>
            </div>
          </div>
          <div className="flex-center gap-sm">
            <button 
              className="btn btn-primary btn-sm cursor-pointer" 
              data-testid={`shadow-now-btn-${idx}`}
              onClick={() => alert?.employee && onShadowEmployee(alert.employee)}
            >
              <Play size={14} /> Shadow Now
            </button>
            <button 
              className="btn btn-secondary btn-sm cursor-pointer" 
              data-testid={`quick-log-btn-${idx}`}
              onClick={() => alert?.employee && onCoachEmployee(alert.employee)}
            >
              <ClipboardList size={14} /> Quick Log
            </button>
          </div>
        </div>
      ))}

      {pendingTasks?.map((task, idx) => (
        <div 
          key={`task-${idx}`} 
          data-testid={`pending-task-card-${idx}`}
          className="glass-card alert-card-warning flex-between flex-wrap gap-md p-md" 
        >
          <div className="flex-center gap-md">
            <div className="flex-center p-sm bg-warning-alpha rounded-full">
              <ClipboardList size={24} color="var(--warning)" />
            </div>
            <div>
              <h3 className="m-0 mb-xs font-bold text-white text-lg">
                Pending Follow-up
              </h3>
              <p className="m-0 text-secondary text-sm">
                {task?.title || 'Untitled Task'} <span className="opacity-50">• {task?.employeeName || 'Unknown Employee'}</span>
              </p>
            </div>
          </div>
          <div className="flex-center gap-sm">
            <button 
              className="btn btn-sm bg-success text-white cursor-pointer border-transparent" 
              data-testid={`mark-complete-btn-${idx}`}
              onClick={() => task?.id && onCompleteFollowUpTask(task.id)}
            >
              <Check size={14} /> Mark Complete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
