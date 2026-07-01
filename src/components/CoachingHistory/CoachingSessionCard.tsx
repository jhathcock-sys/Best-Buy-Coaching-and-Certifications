import React from 'react';
import { Trash2, Clock } from 'lucide-react';
import { CoachingLog } from '../../types';

interface CoachingSessionCardProps {
  session: CoachingLog;
  index: number;
  impact: string;
  onSelect: (session: CoachingLog) => void;
  onDelete: (session: CoachingLog, e: React.MouseEvent) => void;
}

export default function CoachingSessionCard({ session, index, impact, onSelect, onDelete }: CoachingSessionCardProps) {
  return (
    <div 
      data-testid={`session-card-${index}`}
      className="glass-card session-card cursor-pointer"
      onClick={() => onSelect(session)}
    >
      <div>
        <div className="flex-between align-start gap-sm">
          <div className="flex-row align-center gap-sm">
            <img src={session.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" className="avatar-sm border-glass" />
            <div>
              <h4 className="text-base font-bold text-white m-0">{session.employeeName || session.customerName}</h4>
              <span className={`tag-pill tag-mini ${session.category?.includes('Observation') ? 'tag-obs' : session.category?.includes('Practice') ? 'tag-prac' : 'tag-role'}`}>
                {session.category}
              </span>
              {session.coachName && (
                <div className="text-xxs text-muted mt-0-2rem font-medium">
                  Coach: {session.coachName}
                </div>
              )}
            </div>
          </div>
          <button 
            data-testid={`delete-session-btn-${index}`}
            className="btn btn-secondary btn-icon btn-icon-transparent cursor-pointer"
            onClick={(e) => onDelete(session, e)}
          >
            <Trash2 size={14} color="var(--error)" />
          </button>
        </div>

        <p className="session-notes">
          {session.notes}
        </p>
      </div>

      <div className="session-footer">
        <span className="flex-row align-center gap-xs"><Clock size={12} /> {session.date?.split(' ')[0]}</span>
        
        {impact === 'HIGH_IMPACT' && (
          <span className="tag-pill tag-mini text-success bg-success-alpha-15 border-success">
            High Impact 🟢
          </span>
        )}
        {impact === 'NEEDS_FOLLOW_UP' && (
          <span className="tag-pill tag-mini text-error bg-error-alpha-20 border-error">
            Needs Follow Up 🔴
          </span>
        )}
        {impact === 'NEUTRAL' && (
          <span className="tag-pill tag-mini text-muted border-glass">
            Neutral Impact ⚪
          </span>
        )}
        {impact === 'PENDING' && (
          <span className="tag-pill tag-mini text-muted border-glass">
            Impact Pending ⏳
          </span>
        )}

        {session.score !== 100 && (
          <span className={`font-bold ${session.score >= 80 ? 'text-success' : 'text-error'}`}>
            Score: {session.score}%
          </span>
        )}
      </div>
    </div>
  );
}
