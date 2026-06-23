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
    <div className="flex-column gap-md" style={{ animation: 'fadeIn 0.4s ease' }}>
      {activeFocus5Alerts.map((alert, idx) => (
        <div 
          key={`alert-${idx}`} 
          className="glass-card glow-pulse alert-card-danger flex-between flex-wrap gap-md p-md" 
        >
          <div className="flex-center gap-md">
            <div className="flex-center p-sm" style={{ background: 'var(--error-alpha-15)', borderRadius: '50%' }}>
              <AlertCircle size={24} color="var(--error)" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                Missed Focus 5 Contact
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--error)' }}>{alert.employee.name}</strong> is in {alert.zone} but hasn't received a Focus 5 check-in today.
              </p>
            </div>
          </div>
          <div className="flex-center gap-sm">
            <button className="btn btn-primary" onClick={() => onShadowEmployee(alert.employee)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Play size={14} /> Shadow Now
            </button>
            <button className="btn btn-secondary" onClick={() => onCoachEmployee(alert.employee)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
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
            <div className="flex-center p-sm" style={{ background: 'var(--warning-glow)', borderRadius: '50%' }}>
              <ClipboardList size={24} color="var(--warning)" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                Pending Follow-up
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {task.title} <span style={{ opacity: 0.5 }}>• {task.employeeName}</span>
              </p>
            </div>
          </div>
          <div className="flex-center gap-sm">
            <button className="btn btn-primary" onClick={() => onCompleteFollowUpTask(task.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'var(--success)', color: '#000' }}>
              <Check size={14} /> Mark Complete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
