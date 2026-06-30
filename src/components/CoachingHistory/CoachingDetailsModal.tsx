import React from 'react';
import { Volume2 } from 'lucide-react';
import { CoachingLog } from '../../types';

interface CoachingDetailsModalProps {
  session: CoachingLog;
  onClose: () => void;
  isPlayingSpeech: boolean;
  isPausedSpeech: boolean;
  onSpeechPlay: (text: string) => void;
  onSpeechStop: () => void;
}

export default function CoachingDetailsModal({
  session,
  onClose,
  isPlayingSpeech,
  isPausedSpeech,
  onSpeechPlay,
  onSpeechStop
}: CoachingDetailsModalProps) {
  return (
    <div className="modal-overlay cursor-pointer" onClick={onClose} data-testid="coaching-history-modal-overlay">
      <div className="modal-content modal-border-bby cursor-auto" onClick={(e) => e.stopPropagation()} data-testid="coaching-history-modal">
        <div className="modal-header">
          <div className="flex-row align-center gap-sm">
            <img src={session.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" className="avatar-sm" />
            <div>
              <h3 className="text-1-15rem text-white font-heading m-0">
                Coaching Review: {session.employeeName || session.customerName}
              </h3>
              <span className="text-0-7rem text-muted">
                {session.category} | {session.date} {session.coachName ? `| Coach: ${session.coachName}` : ''}
              </span>
            </div>
          </div>
          <button 
            data-testid="modal-close-icon"
            className="btn-close-transparent cursor-pointer" 
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        <div className="modal-body modal-body-scroll">
          <div className="notes-code-block">
            {session.notes}
          </div>

          <div className="tts-controls-container">
            <h4 className="text-0-825rem text-secondary flex-row align-center gap-sm m-0">
              <Volume2 size={15} color="var(--bby-yellow)" /> Coaching Plan Reader (Text-to-Speech)
            </h4>
            <div className="flex-row gap-sm mt-xs">
              <button 
                data-testid="tts-play-btn"
                className={`btn btn-tts cursor-pointer ${isPlayingSpeech && !isPausedSpeech ? 'btn-secondary' : 'btn-accent'}`} 
                onClick={() => onSpeechPlay(session.notes)}
              >
                <Volume2 size={13} /> {isPlayingSpeech ? (isPausedSpeech ? 'Resume' : 'Pause') : 'Read Plan Aloud'}
              </button>
              {isPlayingSpeech && (
                <button 
                  data-testid="tts-stop-btn"
                  className="btn btn-secondary btn-tts-stop cursor-pointer" 
                  onClick={onSpeechStop}
                >
                  Stop
                </button>
              )}
            </div>
            {isPlayingSpeech && (
              <div className="tts-status">
                <span className="pulse-dot pulse-dot-mini"></span>
                <span>{isPausedSpeech ? 'Paused' : 'Currently speaking...'}</span>
              </div>
            )}
          </div>

          <div className="flex-end">
            <button 
              data-testid="modal-close-btn"
              className="btn btn-secondary btn-close-modal cursor-pointer" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
