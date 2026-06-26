import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import { FollowUpTask } from '../../types';

interface ProfileCommitmentsTabProps {
  associateTasks: FollowUpTask[];
}

export default function ProfileCommitmentsTab({ 
  associateTasks
}: ProfileCommitmentsTabProps) {
  return (
    <div className="flex-column gap-md animate-fade-in" data-testid="profile-commitments-tab">
      {!associateTasks || associateTasks.length === 0 ? (
        <div className="text-center p-xl bg-white-alpha-05 rounded-xl border-glass" data-testid="no-tasks-state">
          <CheckCircle size={24} color="var(--text-muted)" className="mb-sm" />
          <p className="text-sm text-muted m-0">
            No pending shadowing commitments scheduled for this associate.
          </p>
        </div>
      ) : (
        <div className="flex-column gap-sm">
          {associateTasks.map((task: FollowUpTask) => (
            <div 
              key={task.id || task.action}
              data-testid="commitment-task-item"
              className={`p-md rounded-xl flex-between align-center gap-md border-glass ${task.completed ? 'bg-success-alpha-15' : 'bg-white-alpha-05'}`}
            >
              <div className="flex-column gap-xs">
                <span className={`text-sm text-white font-bold ${task.completed ? 'line-through opacity-60' : ''}`}>
                  {task.action}
                </span>
                <span className="text-xs text-secondary flex-row align-center gap-xs">
                  <Calendar size={12} /> Due: {task.dueDate}
                </span>
              </div>
              
              <div>
                {task.completed ? (
                  <span className="text-xs text-success font-bold flex-row align-center gap-xs bg-success-alpha-15 p-xs rounded-sm">
                    Resolved
                  </span>
                ) : (
                  <span className="text-xs text-warning font-bold flex-row align-center gap-xs bg-warning-alpha p-xs rounded-sm">
                    Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
