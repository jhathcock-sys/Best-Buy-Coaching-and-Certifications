import { AlertCircle, Check, Play, ClipboardList } from 'lucide-react';

interface DashboardAlertsProps {
  activeFocus5Alerts: any[];
  pendingTasks: any[];
  onNavigate: (view: string) => void;
  onCompleteFollowUpTask: (taskId: string) => void;
  onCoachEmployee: (employee: any) => void;
  onShadowEmployee: (employee: any) => void;
}

export default function DashboardAlerts({ 
  activeFocus5Alerts, 
  pendingTasks, 
  onNavigate, 
  onCompleteFollowUpTask, 
  onCoachEmployee, 
  onShadowEmployee 
}: DashboardAlertsProps) {
  
  if (activeFocus5Alerts.length === 0 && pendingTasks.length === 0) return null;

  return (
    <div className="flex-column gap-md animate-fade-in">
      {activeFocus5Alerts.map((alert, idx) => (
        <div 
          key={`alert-${idx}`} 
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
                <strong className="text-error">{alert.employee.name}</strong> is in {alert.zone} but hasn't received a Focus 5 check-in today.
              </p>
            </div>
          </div>
          <div className="flex-center gap-sm">
            <button className="btn btn-primary btn-sm" onClick={() => onShadowEmployee(alert.employee)}>
              <Play size={14} /> Shadow Now
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => onCoachEmployee(alert.employee)}>
              <ClipboardList size={14} /> Quick Log
            </button>
          </div>
        </div>
      ))}

      {pendingTasks.map((task, idx) => (
        <div 
          key={`task-${idx}`} 
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
                {task.title} <span style={{ opacity: 0.5 }}>• {task.employeeName}</span>
              </p>
            </div>
          </div>
          <div className="flex-center gap-sm">
            <button className="btn btn-primary btn-sm bg-success text-white" onClick={() => onCompleteFollowUpTask(task.id)}>
              <Check size={14} /> Mark Complete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
