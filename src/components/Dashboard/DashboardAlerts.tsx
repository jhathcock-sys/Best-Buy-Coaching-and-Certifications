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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.4s ease' }}>
      {activeFocus5Alerts.map((alert, idx) => (
        <div 
          key={`alert-${idx}`} 
          className="glass-card glow-pulse" 
          style={{ 
            padding: '1rem 1.5rem', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, rgba(11, 15, 25, 0.5) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={24} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                Missed Focus 5 Contact
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#ef4444' }}>{alert.employee.name}</strong> is in {alert.zone} but hasn't received a Focus 5 check-in today.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => onShadowEmployee(alert.employee)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={14} /> Shadow Now
            </button>
            <button className="btn btn-secondary" onClick={() => onCoachEmployee(alert.employee)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={14} /> Quick Log
            </button>
          </div>
        </div>
      ))}

      {pendingTasks.map((task, idx) => (
        <div 
          key={`task-${idx}`} 
          className="glass-card" 
          style={{ 
            padding: '1rem 1.5rem', 
            border: '1px solid rgba(253, 216, 53, 0.3)', 
            background: 'linear-gradient(90deg, rgba(253, 216, 53, 0.05) 0%, rgba(11, 15, 25, 0.5) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(253, 216, 53, 0.15)', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={24} color="#fdd835" />
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => onCompleteFollowUpTask(task.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: '#000' }}>
              <Check size={14} /> Mark Complete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
